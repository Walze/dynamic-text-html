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
  public readonly elementCopy: HTMLElement;

  public constructor(
    public readonly DOMElement: HTMLElement,
    public readonly value: string,
    public readonly type: DynamicTypes,
    public inlineText?: string,
  ) {
    this.elementCopy = this.DOMElement.cloneNode(true) as HTMLElement
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


  private _makeDynamicElement = (type: DynamicTypes, fileName?: string) =>
    (element: HTMLElement): DynamicElement => new DynamicElement(
      element,
      fileName || element.getAttribute(type) as string,
      type,
    )


  /**
   *  Gets element by attribute and gets attributes value
   */
  private _queryElements(
    name: DynamicTypes,
    selectorReference: HTMLElement | Document,
  ): DynamicElement[] {
    const els = Array.from(selectorReference.querySelectorAll(`[${name}]`)) as HTMLElement[]

    return els.map(this._makeDynamicElement(name))
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


    const matchedDyEls = this._matchAttributes(file)
    console.log(matchedDyEls)

    // debugger
    matchedDyEls.map((dyElement) => {
      const div = dyElement.elementCopy.cloneNode() as HTMLElement
      div.innerHTML = file.data

      this._preRender(div)
      this._render(dyElement, div)
      this._postRender(div)

      dyElement.DOMElement.replaceWith(div)
    })

    file.rendered = matchedDyEls.length > 0

    if (!this.files.includes(file))
      this.files.push(file)

  }


  /**
   * Renders new Dynamic elements
   */
  private _preRender(element: HTMLElement) {
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


  /**
   * Gets dynamic element from new element, adds it to this.dyElements and renders unrendered files
   */
  private _postRender(div: HTMLElement) {
    const dyEls = this._getDyElements(div)

    return dyEls.map((dy) => {
      this.dyElements.push(dy)

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
        .replace(match, found.elementCopy.outerHTML.trim())
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
    const prefab = this.dyElements.find((p) =>
      p.value === prefabName
      && p.type === DynamicTypes.prefab,
    )

    if (!prefab) {
      console.warn(`External element '[external = ${prefabName}]' not found on file`)

      return false
    }

    // copies prefab to manage attributes
    const prefabCopy = prefab.elementCopy.cloneNode(true) as HTMLElement
    prefabCopy.removeAttribute('prefab')

    // inline type
    const type = prefab.elementCopy.getAttribute('type') as DynamicTypes | undefined
    if (type) prefabCopy.setAttribute(type, fileName)


    const types = Array
      .from(prefabCopy.querySelectorAll('[type]'))
      .map((el) => {
        const childType = el.getAttribute('type') as string
        // el.removeAttribute('type')

        el.setAttribute(childType, fileName)
      })

    if (this.options.warn && types.length < 1)
      console.warn(`Prefab ${prefab.value} needs at least 1 type`)

    // sets prefab html into dynamic elements html
    element.innerHTML = element.innerHTML
      .replace(match, prefabCopy.outerHTML.trim())

    return true
  }


  /**
   * Renders element by given type
   */
  private _render(dyElement: DynamicElement, div: HTMLElement) {

    switch (dyElement.type) {
      case DynamicTypes.field:
        this._renderField(div)
        break
      case DynamicTypes.lines:
        this._renderLines(dyElement, div)
        break
      case DynamicTypes.loop:
        this._renderLoop(dyElement, div)
        break
      default:
        throw new Error('Tried rendering unknown dynamic element type')
    }
  }


  /**
   *  Renders field attribute
   */
  private _renderField = (el: HTMLElement) => {
    el.innerHTML = SF(el.innerHTML)
      .markdown()
      .string
  }


  /**
   *  Renders lines attribute
   */
  private _renderLines = (dyEl: DynamicElement, newEl: HTMLElement, lines?: string[]) => {
    const linesArray = lines || getMarkedLines(newEl.innerHTML.trim())
    let index = 0

    newEl.innerHTML = dyEl.elementCopy.innerHTML
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
  private _renderLoop = (dyEl: DynamicElement, newEl: HTMLElement) => {
    const loop = dyEl.elementCopy
    const model = loop.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const breaks = Number(loop.getAttribute('breaks')) || 1

    const liness = SF(newEl.innerHTML)
      .splitEveryNthLineBreak(breaks)

    const modelCopy = model.cloneNode(true) as HTMLElement
    // loop.removeChild(model)

    const newLoopDiv = newEl.cloneNode() as HTMLElement

    liness.map((a) => {
      const newHTML = model.cloneNode(true) as HTMLElement

      this._renderLines(
        this._makeDynamicElement(DynamicTypes.lines, dyEl.value)(modelCopy),
        newHTML,
        a,
      )

      newLoopDiv.append(newHTML)
    })

    newEl.innerHTML = newLoopDiv.innerHTML
  }


  /**
   *  Checks is the file is valid
   */
  private _checkValidFile = (file: IFile) => {

    if (typeof file.name !== 'string')
      throw new Error('file name is not string')

    if (typeof file.data !== 'string')
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file data is empty')

  }
}
