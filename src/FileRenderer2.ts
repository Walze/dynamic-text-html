import { globalMatch, flat, makeFile } from './helpers'
import { SF, getMarkedLines } from './StringFormatter'
import {
  DynamicTypes,
  IFile,
  IFileRendererOptions,
} from './types'
import { DynamicElement } from './DynamicElement'


export const selectors = {
  externalRGX: /\[([^\[\]]+?)?\[(.+?)?\]([^\[\]]+?)?\]/gm,
  model: '.model',
  model_line: '.model-line', // deprecated
  line: /\[line-?(-)?(\d*)\]/g,
}

// tslint:disable-next-line:max-classes-per-file
export class FileRenderer2 {

  public dyElements: DynamicElement[]
  // private _lastFile: IFile | undefined

  public constructor(
    public files: IFile[],
    public ext: string = 'md',
    public selectorReference: HTMLElement | Document = document,
    public options: IFileRendererOptions = {},
  ) {
    this.files.map((file) => {
      file.rendered = false
      this._checkValidFile(file)
    })

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

    return els.map((el) => new DynamicElement(el, type))
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
    const filter = (dyEl: DynamicElement) => dyEl.value === file.name && dyEl.htmlDyEl

    return this.dyElements.filter(filter)
  }

  public render() {
    this.files.map((file) => {
      this.renderFile(file)
    })
  }


  private renderFile(file: IFile) {

    file.data = SF(file.data)
      .removeComments()
      .string

    const matchedDyEls = this
      ._matchAttributes(file)
      .map(
        this._renderDyEl(file.data),
      )

    file.rendered = matchedDyEls.length > 0
  }


  private _renderDyEl(text: string): (value: DynamicElement) => void {
    return (dyElement) => {
      const newDyEl = new DynamicElement(dyElement.element.cloneNode() as HTMLElement)

      newDyEl.innerHTML = text

      this._handleExternals(newDyEl)
      this._render(dyElement, newDyEl)

      dyElement.update(newDyEl)
    }
  }

  /**
   * Renders new Dynamic elements
   */
  private _handleExternals(textDyel: DynamicElement) {
    const externalMatches = globalMatch(selectors.externalRGX, textDyel.innerHTML)

    if (externalMatches) {
      externalMatches.map((matchRGX) => {
        const prefab = matchRGX[2]
        console.log(externalMatches, prefab)

        if (prefab)
          this._renderPrefab(matchRGX, textDyel)
        else
          this._renderExternal(matchRGX, textDyel)
      })
    }

  }

  private _renderExternal(matchRGX: RegExpMatchArray, { element }: DynamicElement) {
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


  private _renderPrefab(matchRGX: RegExpMatchArray, { element }: DynamicElement): boolean {
    // 1 == texto
    // 2 == prefab
    // 3 == file

    const { 0: match, 2: prefabName } = matchRGX
    let { 1: fileN, 3: fileOrText } = matchRGX
    if (!fileOrText) return false
    fileOrText = fileOrText.trim()

    // console.warn(fileOrText)

    const foundFile = this.files.find((f) => f.name === fileOrText)
    const file: IFile = foundFile
      ? foundFile
      : makeFile('INLINE_TEXT', fileOrText, '')

    // finds prefab
    const prefabFound = this.dyElements.find((p) =>
      p.value === prefabName
      && p.type === DynamicTypes.external,
    )

    if (!prefabFound) {
      console.warn(`Prefab element '[external = ${prefabName}]' not found`)

      return false
    }

    // copies prefab to manage attributes
    const prefab = prefabFound.clone()
    prefab.element.removeAttribute('prefab')

    // inline type
    const type = prefab.element.getAttribute('type') as DynamicTypes | undefined
    if (type) prefab.element.setAttribute(type, file.name)

    const types = prefab.dynamicFields.map((el) => {
      const childType = el.getAttribute('type') as string

      el.setAttribute(childType, file.name)
    })

    if (this.options.warn && types.length < 1)
      console.warn(`Prefab ${prefab.value} needs at least 1 type`)


    this._getDyElements(prefab.element)
      .map((dyel) => {

        const inline = dyel.element.hasAttribute('inline')
        const func = inline
          ? this._renderDyEl(file.data)
          : this._renderDyEl(file.data)

        func(dyel)
      })

    console.log(prefab.element)

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
    const linesArray = lines || getMarkedLines(textDyEl.innerHTML.trim())
    let index = 0

    textDyEl.innerHTML = dyEl.innerHTML
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

    const model = dyEl.cloneQuery(selectors.model)
    loopDyel.clearInner()

    if (!model) throw new Error('model not found')

    const breaks = Number(loop.getAttribute('breaks')) || 1
    const liness = SF(textDyEl.innerHTML)
      .splitEveryNthLineBreak(breaks)

    const modelDyel = new DynamicElement(model.cloneNode(true) as HTMLElement)

    liness.map((lines) => {
      const textCopy = modelDyel.clone()

      this._renderLines(modelDyel, textCopy, lines)

      loop.append(textCopy.element)
    })


    textDyEl.innerHTML = loop.innerHTML
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
