import { makeFile, globalMatch } from './helpers';
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
      .map(this._makeDynamicElement(name))

  private _makeDynamicElement = (type: DynamicTypes, fileName?: string) =>
    (element: Element): IDynamicElement => ({
      element,
      type,
      file: fileName || element.getAttribute(type) as string,
    })

  /**
   *  Gets all attributes
   */
  private _getAttributes(
    selectorReference: Element | Document = this.selectorReference,
  ): IDynamicElementsObject {
    const field = this._getDynamicElements(selectors.field, selectorReference)
    const lines = this._getDynamicElements(selectors.lines, selectorReference)
    const loop = this._getDynamicElements(selectors.loops, selectorReference)
    const external = this._getDynamicElements(selectors.external, selectorReference)

    return { field, lines, loop, external }
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
    const matchElWithString = ({ file: name }: IDynamicElement) => name === file.name

    const field = this.attributes.field.filter(matchElWithString)
    const line = this.attributes.lines.filter(matchElWithString)
    const loop = this.attributes.loop.filter(matchElWithString)

    const arr = [
      ...field,
      ...line,
      ...loop,
    ]

    const checkedElements: Element[] = []

    const elementReferenceHandler = (item: IDynamicElement | undefined) => {
      const dynamicElement = item as IDynamicElement

      if (checkedElements.includes(dynamicElement.element))
        return dynamicElement

      const passed = this._checkElementInBody(dynamicElement, file)

      checkedElements.push(dynamicElement.element)

      return passed
        ? dynamicElement
        : this.attributes[dynamicElement.type].find(matchElWithString) as IDynamicElement
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
    console.warn(file, dynamicEls)

    const _render = (dyElement: IDynamicElement) => {

      const matches = globalMatch(selectors.externalRGX, dataSF.string)

      if (matches)
        matches.map((matchRGX) => {
          const [match, external, fileName] = matchRGX

          console.log(match)

          if (external === file.name)
            file.data = file.data
              .replace(match, dyElement.element.outerHTML)
              .replace(/>\s+</gu, "><")

        })


      // const replaced = dataSF.replaceExternal(dyElement)
      // const text = replaced.text

      this._renderByType(dyElement, file)

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
  private _renderByType(dyElement: IDynamicElement, file: IFile) {

    switch (dyElement.type) {
      case DynamicTypes.field:
        this._renderField(dyElement, file)
        break
      case DynamicTypes.lines:
        this._renderLines(dyElement, file)
        break
      case DynamicTypes.loop:
        this._renderLoops(dyElement, file)
        break
      default:
        throw new Error('Tried rendering unknown dynamic element type')
    }

  }

  /**
   *  Renders field attribute
   */
  private _renderField = ({ element: el }: IDynamicElement, { data }: IFile) => {
    el.innerHTML = SF(data)
      .markdown()
      .string
  }

  /**
   *  Renders lines attribute
   */
  private _renderLines = ({ element: el }: IDynamicElement, { data }: IFile) => {
    const linesArray = getMarkedLines(data)

    let index = 0

    el.innerHTML = el.innerHTML.replace(selectors.line, (...args: string[]) => {
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
  private _renderLoops = ({ element: el }: IDynamicElement, file: IFile) => {
    const { data } = file
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
        'Fix your render order.',
        'File:', file.nameWExt,
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
