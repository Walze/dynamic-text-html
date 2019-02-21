import { globalMatch, mapEnum, flat } from './helpers'
import { SF, getMarkedLines } from './StringFormatter'
import {
  DynamicTypes,
  IFile,
  IFileRendererOptions,
} from './types'


export class DynamicElement {
  public static htmlRenderable = `${DynamicTypes.field} ${DynamicTypes.lines} ${DynamicTypes.loop}`
  public static types = mapEnum(DynamicTypes)

  public readonly value: string
  public readonly dynamicFields: HTMLElement[]

  public constructor(
    public readonly type: DynamicTypes,
    public element: HTMLElement,
    fileName?: string | undefined,
    public cloned: boolean = false,
    public inlineText?: string,
  ) {
    this.value = fileName || element.getAttribute(type) as string
    this.dynamicFields = Array.from(element.querySelectorAll('[type]'))
  }

  public clone(deep = true) {
    const clone = this.element.cloneNode(deep) as HTMLElement

    return new DynamicElement(this.type, clone, this.value, true)
  }

  public update(dyEl: DynamicElement) {
    this.element.replaceWith(dyEl.element)
    this.element = dyEl.element
  }

}
export const selectors = {
  externalRGX: /\[\[(.+)?\](.+)?\]/g,
  model: '.model',
  model_line: '.model-line', // deprecated
  line: /\[line-?(-)?(\d*)\]/g,
}

// tslint:disable-next-line:max-classes-per-file
export class FileRenderer2 {

  public dyElements: DynamicElement[]
  public files: IFile[] = []
  // private _lastFile: IFile | undefined

  public constructor(
    public ext: string = 'md',
    public selectorReference: HTMLElement | Document = document,
    public options: IFileRendererOptions = {},
  ) {
    this.dyElements = this._getDyElements()
  }


  /**
   *  Gets element by attribute and gets attributes value
   */
  private _queryElements = (
    type: DynamicTypes,
    selectorReference: HTMLElement | Document,
  ): DynamicElement[] => {
    const els = Array.from(selectorReference.querySelectorAll(`[${type}]`)) as HTMLElement[]

    return els.map((el) => new DynamicElement(type, el))
  }


  /**
   *  Gets all attributes
   */
  private _getDyElements(
    selectorReference: HTMLElement | Document = this.selectorReference,
  ): DynamicElement[] {
    return flat(
      DynamicElement.types.map((type) => this._queryElements(type, selectorReference)),
    )
  }


  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFile) {
    const filter = (dyEl: DynamicElement) =>
      dyEl.value === file.name
      && DynamicElement.htmlRenderable.includes(dyEl.type)

    return this.dyElements.filter(filter)
  }


  public render(file: IFile) {
    if (file.rendered && this.options.warn) {
      console.warn('file already rendered', file)
    }

    this._checkValidFile(file)

    file.data = SF(file.data)
      .removeComments()
      .string

    const matchedDyEls = this
      ._matchAttributes(file)
      .map(this._renderDyEl(file))

    file.rendered = matchedDyEls.length > 0

    if (!this.files.includes(file))
      this.files.push(file)

  }


  private _renderDyEl(file: IFile): (
    value: DynamicElement,
    index: number,
    array: DynamicElement[],
  ) => void {
    return (dyElement) => {
      const newDyEl = new DynamicElement(
        DynamicTypes.text,
        dyElement.element.cloneNode() as HTMLElement,
        file.name,
      )
      newDyEl.element.innerHTML = file.data

      this._preRender(newDyEl)
      this._render(dyElement, newDyEl)
      this._postRender(newDyEl)

      dyElement.update(newDyEl)
    }
  }

  /**
   * Renders new Dynamic elements
   */
  private _preRender({ element }: DynamicElement) {
    const externalMatches = globalMatch(selectors.externalRGX, element.innerHTML)

    if (externalMatches) {
      externalMatches.map((matchRGX) => {
        const prefab = matchRGX[2]

        if (prefab)
          this._renderPrefab(matchRGX, element)
        else
          this._renderExternal(matchRGX, element)
      })
    }

  }

  private _push(dyel: DynamicElement) {
    let shouldPush = true

    this.dyElements.map((dy) => {
      if (dy.type === dyel.type && dy.element === dyel.element)
        shouldPush = false
    })

    if (shouldPush)
      this.dyElements.push(dyel)
    else {
      console.warn('Tried pushing same DynamicElement into array')
    }
  }


  /**
   * Gets dynamic element from new element, adds it to this.dyElements and renders unrendered files
   */
  private _postRender({ element }: DynamicElement) {
    const dyEls = this._getDyElements(element)

    return dyEls.map((dy) => {
      this._push(dy)

      // if file already went by, find it and render it
      const foundFile = this.files.find((f) => f.name === dy.value)
      if (foundFile)
        this.render(foundFile)
    })
  }


  private _renderExternal(matchRGX: RegExpMatchArray, element: HTMLElement) {
    const { 0: match, 1: external } = matchRGX

    const found = this.dyElements
      .find(({ value: externalName, type }) =>
        external === externalName
        && type === DynamicTypes.external,
      )

    if (found)
      element.innerHTML = element.innerHTML
        .replace(match, found.element.outerHTML.trim())
        .replace(/>\s+</gu, "><")
    else {
      console.warn(`External element '[prefab = ${external}]' not found on file`)

      element.innerHTML = element.innerHTML
        .replace(match, 'NOT FOUND')
    }
  }


  private _renderPrefab(matchRGX: RegExpMatchArray, element: HTMLElement): boolean {
    // 1 == texto
    // 2 == prefab
    // 3 == file

    const { 0: match, 1: prefabName } = matchRGX
    let { 2: fileName } = matchRGX
    if (!fileName) return false

    fileName = fileName.trim()

    // finds prefab
    const prefabFound = this.dyElements.find((p) =>
      p.value === prefabName
      && p.type === DynamicTypes.external,
    )

    if (!prefabFound) {
      console.warn(`External element '[external = ${prefabName}]' not found`)

      return false
    }

    // copies prefab to manage attributes
    const prefab = prefabFound.clone()
    prefab.element.removeAttribute('prefab')

    // inline type
    const type = prefab.element.getAttribute('type') as DynamicTypes | undefined
    if (type) prefab.element.setAttribute(type, fileName)

    const types = prefab.dynamicFields.map((el) => {
      const childType = el.getAttribute('type') as string
      // el.removeAttribute('type')

      el.setAttribute(childType, fileName)
    })

    if (this.options.warn && types.length < 1)
      console.warn(`Prefab ${prefab.value} needs at least 1 type`)

    // sets prefab html into dynamic elements html
    element.innerHTML = element.innerHTML
      .replace(match, prefab.element.outerHTML.trim())

    return true
  }


  /**
   * Renders element by given type
   */
  private _render(dyEl: DynamicElement, textDyEl: DynamicElement) {

    switch (dyEl.type) {
      case DynamicTypes.field:
        this._renderField(textDyEl)
        break
      case DynamicTypes.lines:
        this._renderLines(dyEl, textDyEl)
        break
      case DynamicTypes.loop:
        this._renderLoop(dyEl, textDyEl)
        break
      default:
        throw new Error('Tried rendering unknown dynamic element type')
    }
  }


  /**
   *  Renders field attribute
   */
  private readonly _renderField = ({ element }: DynamicElement) => {
    element.innerHTML = SF(element.innerHTML)
      .markdown()
      .string
  }


  /**
   *  Renders lines attribute
   * @param dyEl where divs and structure come from
   * @param textDyEl where text comes from and goes to
   */
  private readonly _renderLines = (dyEl: DynamicElement, textDyEl: DynamicElement, lines?: string[]) => {
    const linesArray = lines || getMarkedLines(textDyEl.element.innerHTML.trim())
    let index = 0

    textDyEl.element.innerHTML = dyEl.element.innerHTML
      .replace(selectors.line, (...args: string[]) => {

        const skip = !!args[1]
        const line = parseInt(args[2], 10)
        const text = linesArray[index]

        if (skip) {
          index += 1

          return ''
        }

        if (!isNaN(line)) {
          return linesArray[line]
        }

        index += 1

        return text
      })

  }


  /**
   *  Renders the loop attribute
   */
  private readonly _renderLoop = (dyEl: DynamicElement, textDyEl: DynamicElement) => {
    const loopDyel = dyEl.clone()
    const loop = loopDyel.element

    const model = loop.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const breaks = Number(loop.getAttribute('breaks')) || 1
    const liness = SF(textDyEl.element.innerHTML)
      .splitEveryNthLineBreak(breaks)

    liness.map(lines => {
      const modelDyel = new DynamicElement(
        DynamicTypes.lines,
        model.cloneNode(true) as HTMLElement,
      )
      const textCopy = textDyEl.clone()
      console.log(textCopy.element)

      // this._renderLines(modelDyel, textCopy, lines)

      // loop.append(textDyEl.element)
    })

    textDyEl.element.innerHTML = loop.innerHTML
  }


  /**
   *  Checks is the file is valid
   */
  private readonly _checkValidFile = (file: IFile) => {

    // tslint:disable-next-line: strict-type-predicates
    if (typeof file.name !== 'string')
      throw new Error('file name is not string')

    // tslint:disable-next-line: strict-type-predicates
    if (typeof file.data !== 'string')
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file data is empty')

  }
}
