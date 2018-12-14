import '../css/dynamic-files.css'

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
  model: '.model',
  model_line: '.model-line',
  line: /\[line-?(\d*)\]/g,
}

const markdownLine = (lineTxt: string) => SF(lineTxt)
  .markdown()
  .removePTag()
  .string
  .trim()

const getLines = (data: string) => SF(data)
  .everyNthLineBreak(1)

const getMarkedLines = (data: string) => getLines(data)
  .map(markdownLine)


export class FileRenderer {

  public attributes: IDynamicElementsObject
  public files: IFile[] = []
  // private _lastFile: IFile | undefined

  public constructor(
    public ext: string = 'md',
    public selectorReference: Element | Document = document,
  ) {
    this.attributes = this._getAttributes()
    this._listenKeysToShowFileNames()
  }

  /**
   *  Gets element by attribute and gets attributes value
   */
  private _getDynamicElements = (
    name: DynamicTypes,
    selectorReference: Element | Document,
  ): IDynamicElement[] =>
    Array
      .from(selectorReference.querySelectorAll(`[${name}]`))
      .map((element) => ({
        element,
        type: name,
        file: element.getAttribute(name) as string,
      }))

  /**
   *  Gets all attributes
   */
  private _getAttributes(
    selectorReference: Element | Document = this.selectorReference,
  ): IDynamicElementsObject {
    const field = this._getDynamicElements(selectors.field, selectorReference)
    const lines = this._getDynamicElements(selectors.lines, selectorReference)
    const loop = this._getDynamicElements(selectors.loops, selectorReference)

    return { field, lines, loop }
  }

  /**
   * Gets one attribute
   */
  private _getAttribute(
    type: DynamicTypes,
    selectorReference: Element | Document = this.selectorReference,
  ) {
    return this._getDynamicElements(type, selectorReference)
  }

  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFile) {
    const match = ({ file: name }: IDynamicElement) => `${name}.${this.ext}` === file.name

    const field = this.attributes.field.filter(match)
    const line = this.attributes.lines.filter(match)
    const loop = this.attributes.loop.filter(match)

    const arr = [
      ...field,
      ...line,
      ...loop,
    ]

    const checkedElements: Element[] = []

    const elementReferenceHandler = (item: IDynamicElement | undefined) => {
      const dynamicElement = item as IDynamicElement

      if (checkedElements.includes(dynamicElement.element)) return dynamicElement

      const passed = this._checkElementInBody(dynamicElement, file)

      checkedElements.push(dynamicElement.element)

      return passed
        ? dynamicElement
        : this.attributes[dynamicElement.type].find(match) as IDynamicElement
    }

    return arr
      .filter((item) => item)
      .map(elementReferenceHandler)
  }

  public render(file: IFile) {
    this._checkValidFile(file)

    const dataSF = SF(file.data)
      .removeComments()

    const dynamicEls = this._matchAttributes(file)

    const _render = (dyElement: IDynamicElement) => {
      const text = dataSF
        .replaceExternal(dyElement)
        .string

      this._renderByType(dyElement, text)

      this._setFileNameToggle(file.name, dyElement.element)
    }

    dynamicEls.map(_render)

    file.rendered = dynamicEls.length > 0
    // this._lastFile = file

    if (!this.files.includes(file))
      this.files.push(file)
  }

  /**
   * Renders element by given name
   */
  private _renderByType(dyElement: IDynamicElement, text: string) {

    switch (dyElement.type) {
      case DynamicTypes.field:
        this._renderField(dyElement, text)
        break
      case DynamicTypes.lines:
        this._renderLines(dyElement, text)
        break
      case DynamicTypes.loop:
        this._renderLoops(dyElement, text)
        break
      default:
        throw new Error('Tried rendering unknown type')
    }

  }

  /**
   *  Renders field attribute
   */
  private _renderField = ({ element: el }: IDynamicElement, data: string) => {
    el.innerHTML = SF(data)
      .markdown()
      .string
  }

  /**
   *  Renders lines attribute
   */
  private _renderLines = ({ element: el }: IDynamicElement, data: string) => {
    const linesArray = getMarkedLines(data)

    let index = 0

    console.log(linesArray)

    el.innerHTML = el.innerHTML.replace(selectors.line, () => linesArray[index++])
  }

  /**
   *  Renders the loop attribute
   */
  private _renderLoops = ({ element: el }: IDynamicElement, data: string) => {
    const linesArray = getMarkedLines(data)

    const model = el.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const modelLineDiv = el.querySelector(selectors.model_line)
    if (!modelLineDiv) throw new Error('Model line not found')

    let newHTML = ''

    const markdownLoopLines = (lineTxt: string) => {
      const div = model.cloneNode(true) as Element
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

  /**
   *  Checks if the elAttr still has a reference to an element in the document body
   */
  private _checkElementInBody(elAttr: IDynamicElement, file: IFile) {

    if (!document.body.contains(elAttr.element)) {
      console.warn(
        'Element is not on body, probably lost reference.',
        'Getting fields and lines again, this may cause performance decrease.',
        'On file:', file.name,
      )

      this.attributes[elAttr.type] = this._getAttribute(elAttr.type)

      return false
    }

    return true
  }

  private _setFileNameToggle = (fileName: string, el: Element) => {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = SF(fileName)
      .makeElement(`span`)
      .outerHTML

    el.classList.add('dynamic')
    el.appendChild(overlay)

  }

  private _listenKeysToShowFileNames = () => {
    let keys: { [key: string]: boolean } = {
      z: false,
      x: false,
      c: false,
    }
    const keysReset = { ...keys }

    let showFiles: Element[] | undefined
    let state = false

    window.addEventListener('keydown', ({ key }) => {
      if (keys.hasOwnProperty(key)) keys[key] = true
      if (!showFiles) showFiles = Array.from(this.selectorReference.querySelectorAll(`.show-file-name`))

      if (keys.z && keys.x && keys.c) {
        showFiles.map((el) => !state ? el.classList.add('active') : el.classList.remove('active'))
        state = !state
        keys = { ...keysReset }
      }
    })

    window.addEventListener('keyup', ({ key }) => {
      if (keys.hasOwnProperty(key))
        keys[key] = false
    })
  }

}
