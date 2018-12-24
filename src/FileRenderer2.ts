import { mapObjToArray } from './helpers';
import { SF } from './StringFormatter'
import {
  DynamicTypes,
  IDynamicElementsObject,
  IFile,
  IDynamicElement,
} from './types'
import { globalMatch } from './barrel';


export const selectors = {
  field: DynamicTypes.field,
  lines: DynamicTypes.lines,
  loops: DynamicTypes.loop,
  prefab: DynamicTypes.prefab,
  external: DynamicTypes.external,
  externalRGX: /\[\[(.+)?\](.+)?\]/g,
  model: '.model',
  model_line: '.model-line',
  line: /\[line-?(-)?(\d*)\]/g,
}

const markdownLine = (lineTxt: string) => SF(lineTxt)
  .markdown()
  .removePTag()
  .string
  .trim()

const getLines = (data: string) => SF(data)
  .everyNthLineBreak(1)

export const getMarkedLines = (data: string) => getLines(data)
  .map(markdownLine)

export class FileRenderer2 {


  public dyElements: IDynamicElementsObject
  public files: IFile[] = []
  // private _lastFile: IFile | undefined

  public constructor(
    public ext: string = 'md',
    public selectorReference: Element | Document = document,
  ) {
    this.dyElements = this._getDyElements()
  }

  private _makeDynamicElement = (type: DynamicTypes, fileName?: string) =>
    (element: Element): IDynamicElement => ({
      elementCopy: element.cloneNode(true) as Element,
      DOMElement: element,
      type,
      value: fileName || element.getAttribute(type) as string,
    })

  /**
   *  Gets element by attribute and gets attributes value
   */
  private _queryElements = (
    name: DynamicTypes,
    selectorReference: Element | Document,
  ): IDynamicElement[] =>
    Array
      .from(selectorReference.querySelectorAll(`[${name}]`))
      .map(this._makeDynamicElement(name))

  /**
   *  Gets all attributes
   */
  private _getDyElements(
    selectorReference: Element | Document = this.selectorReference,
  ): IDynamicElementsObject {
    const field = this._queryElements(selectors.field, selectorReference)
    const lines = this._queryElements(selectors.lines, selectorReference)
    const loop = this._queryElements(selectors.loops, selectorReference)
    const external = this._queryElements(selectors.external, selectorReference)
    const prefab = this._queryElements(selectors.prefab, selectorReference)

    return { field, lines, loop, external, prefab }
  }


  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFile) {
    const matchElWithString = ({ value: name }: IDynamicElement) => name === file.name

    const field = this.dyElements.field.filter(matchElWithString)
    const line = this.dyElements.lines.filter(matchElWithString)
    const loop = this.dyElements.loop.filter(matchElWithString)

    const arr = [
      ...field,
      ...line,
      ...loop,
    ]

    return arr
      .filter((item) => item)
  }


  public render(file: IFile) {
    if (file.rendered) {
      console.warn('file already rendered', file)
    }

    this._checkValidFile(file)

    file.data = SF(file.data)
      .removeComments()
      .string


    const matchedDyEls = this._matchAttributes(file)
    // debugger
    matchedDyEls.map((dyElement) => {
      const div = document.createElement(dyElement.elementCopy.tagName)
      div.innerHTML = file.data

      this._preRender(div)
      this._renderByType(dyElement, div)
      this._postRender(div, file)

      dyElement.DOMElement.replaceWith(div)
    })

    file.rendered = matchedDyEls.length > 0

    if (!this.files.includes(file))
      this.files.push(file)

  }


  /**
   * Gets dynamic element from new element, adds it to this.dyElements and renders unrendered files
   */
  private _postRender(div: HTMLElement, file: IFile) {
    const dyEls = this._getDyElements(div)

    return mapObjToArray(dyEls, (e) => e)
      .flat()
      .map((dy) => {
        this.dyElements[dy.type].push(dy)

        // if file already went by, find it and render it
        const foundFile = this.files.find((f) => f.name === dy.value && !file.rendered)
        if (foundFile)
          this.render(foundFile)
      })
  }


  /**
   * Renders new Dynamic elements
   */
  private _preRender(element: Element) {
    const externalMatches = globalMatch(selectors.externalRGX, element.innerHTML)

    if (externalMatches) {
      externalMatches.map((matchRGX) => {

        const prefab = this._renderPrefab(matchRGX, element)
        if (prefab) return

        this._renderExternal(matchRGX, element)
      })
    }

  }


  private _renderExternal(matchRGX: RegExpMatchArray, element: Element) {
    const { 0: match, 1: external } = matchRGX

    const found = this.dyElements.external
      .find(({ value: externalName }) => external === externalName)

    if (found)
      element.innerHTML = element.innerHTML
        .replace(match, found.elementCopy.outerHTML.trim())
        .replace(/>\s+</gu, "><")
    else {
      console.warn(`External element '[external = ${external}]' not found on file`)

      element.innerHTML = element.innerHTML
        .replace(match, 'NOT FOUND')
    }
  }


  private _renderPrefab(matchRGX: RegExpMatchArray, element: Element) {
    const { 0: match, 1: external } = matchRGX
    let { 2: fileName } = matchRGX
    if (!fileName) return false

    fileName = fileName.trim()

    // finds prefab
    const prefab = this.dyElements.prefab.find((p) => p.value === external)
    if (!prefab) {
      console.warn(`External element '[external = ${external}]' not found on file`)

      return false
    }

    // gets type of prefab
    const type = prefab.elementCopy.getAttribute('type') as DynamicTypes | undefined
    if (!type) {
      console.log('prefab has no type')

      return false
    }

    // copies prefab and manages attributes
    const prefabCopy = prefab.elementCopy.cloneNode(true) as Element
    prefabCopy.removeAttribute('prefab')
    prefabCopy.removeAttribute('type')
    prefabCopy.setAttribute(type, fileName)

    // sets prefab html into dynamic elements html
    element.innerHTML = element.innerHTML
      .replace(match, prefabCopy.outerHTML.trim())
      .replace(/>\s+</gu, "><")

    return true
  }


  /**
   * Renders element by given type
   */
  private _renderByType(dyElement: IDynamicElement, div: Element) {

    switch (dyElement.type) {
      case DynamicTypes.field:
        this._renderField(div)
        break
      case DynamicTypes.lines:
        this._renderLines(div)
        break
      case DynamicTypes.loop:
        this._renderLoops(dyElement, div)
        break
      default:
        throw new Error('Tried rendering unknown dynamic element type')
    }
  }


  /**
   *  Renders field attribute
   */
  private _renderField = (el: Element) => {
    el.innerHTML = SF(el.innerHTML)
      .markdown()
      .string
  }


  /**
   *  Renders lines attribute
   */
  private _renderLines = (el: Element) => {
    const linesArray = getMarkedLines(el.innerHTML)
    let index = 0

    el.innerHTML = el.innerHTML
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
  private _renderLoops = (dyEl: IDynamicElement, el: Element) => {
    const linesArray = getMarkedLines(el.innerHTML)

    const model = dyEl.elementCopy.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const modelLineDiv = dyEl.elementCopy.querySelector(selectors.model_line)
    if (!modelLineDiv) throw new Error('Model line not found')

    let newHTML = ''

    const div = model.cloneNode(true) as Element

    const markdownLoopLines = (lineTxt: string) => {

      const line = div.querySelector(selectors.model_line) as Element

      line.innerHTML = SF(lineTxt)
        .markdown()
        .string

      newHTML += div.outerHTML
    }

    linesArray.map(markdownLoopLines)

    el.innerHTML = newHTML
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
