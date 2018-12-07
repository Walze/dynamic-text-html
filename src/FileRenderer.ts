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
  line: '[line]',
}

export class FileRenderer {

  public attributes: IDynamicElementsObject
  public files: IFile[] = []

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
  private _getAttributeElements = (name: DynamicTypes): IDynamicElement[] =>
    Array
      .from(this.selectorReference.querySelectorAll(`[${name}]`))
      .map((element) => ({
        element,
        type: name,
        file: element.getAttribute(name) as string,
      }))

  /**
   *  Gets all attributes
   */
  private _getAttributes(): IDynamicElementsObject {
    const field = this._getAttributeElements(selectors.field)
    const lines = this._getAttributeElements(selectors.lines)
    const loop = this._getAttributeElements(selectors.loops)

    return { field, lines, loop }
  }

  /**
   * Gets one attribute
   */
  private _getAttribute(type: DynamicTypes) {
    return this._getAttributeElements(type)
  }

  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFile) {
    const match = ({ file: name }: IDynamicElement) => `${name}.${this.ext}` === file.name

    const field = this.attributes.field.find(match)
    const line = this.attributes.lines.find(match)
    const loop = this.attributes.loop.find(match)

    const arr = [
      field,
      line,
      loop,
    ]

    const elementReferenceHandler = (item: IDynamicElement | undefined) => {
      const elAttr = item as IDynamicElement
      const passed = this._checkElementInBody(elAttr, file)

      return passed
        ? elAttr
        : this.attributes[elAttr.type].find(match) as IDynamicElement
    }

    return arr
      .filter((item) => item)
      .map(elementReferenceHandler)
  }

  public render(file: IFile) {
    this._checkValidFile(file)
    this.files.push(file)

    const dataSF = SF(file.data)
      .removeComments()

    const dynamicEls = this._matchAttributes(file)

    const dynamicElementRendererMapFunction = (elAttr: IDynamicElement) => {
      const text = dataSF
        .replaceExternal(elAttr)
        .string

      this._render(elAttr, text)
      this._setFileNameToggle(file.name, elAttr.element)
    }

    dynamicEls.map(dynamicElementRendererMapFunction)
  }

  /**
   * Renders element by given name
   */
  private _render(elAttr: IDynamicElement, text: string) {

    // tslint:disable-next-line:switch-default
    switch (elAttr.type) {
      case DynamicTypes.field:
        this._renderField(elAttr, text)
        break
      case DynamicTypes.lines:
        this._renderLines(elAttr, text)
        break
      case DynamicTypes.loop:
        this._renderLoops(elAttr, text)
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
    const linesArray = SF(data)
      .everyNthLineBreak(1)
      .map((line) =>
        SF(line)
          .markdown()
          .removePTag()
          .string
          .trim(),
      )


    const lines = Array
      .from(el.querySelectorAll(selectors.line))

    lines
      .map((line, i) => line.innerHTML = linesArray[i])
  }

  /**
   *  Renders the loop attribute
   */
  private _renderLoops = ({ element: el }: IDynamicElement, data: string) => {
    const linesArray = SF(data)
      .everyNthLineBreak(1)
      .map((lineTxt) =>
        SF(lineTxt)
          .markdown()
          .removePTag()
          .string
          .trim(),
      )

    const model = el.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const modelLineDiv = el.querySelector(selectors.model_line)
    if (!modelLineDiv) throw new Error('Model line not found')

    let newHTML = ''

    linesArray.map((lineTxt) => {
      const div = model.cloneNode(true) as Element
      const line = div.querySelector(selectors.model_line) as Element

      line.innerHTML = SF(lineTxt)
        .markdown()
        .string

      newHTML += div.outerHTML
    })

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
