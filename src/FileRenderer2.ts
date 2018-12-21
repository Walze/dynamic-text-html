import { SF } from './StringFormatter'
import {
  DynamicTypes,
  IDynamicElementsObject,
  IFile,
  IDynamicElement,
} from './types'


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

    matchedDyEls.map((dyElement) => {
      const div = document.createElement(dyElement.elementCopy.tagName)
      div.innerHTML = file.data

      this._renderByType(dyElement, div)

      dyElement.DOMElement.replaceWith(div)
    })

  }

  /**
   * Renders element by given type
   */
  public _renderByType(dyElement: IDynamicElement, div: Element) {

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
