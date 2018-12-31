import { globalMatch } from './helpers'
import '../css/dynamic-files.css'

import { SF } from './StringFormatter'
import {
  DynamicTypes,
  IDynamicElementsObject,
  IFile,
  IDynamicElement,
} from './types'
import { selectors } from './FileRenderer2';

const markdownLine = (lineTxt: string) => SF(lineTxt)
  .markdown()
  .removePTag()
  .string
  .trim()

const getLines = (data: string) => SF(data)
  .splitConsecutiveLineBreaks(1)

const getMarkedLines = (data: string) => getLines(data)
  .map(markdownLine)


export class FileRenderer {

  public attributes: IDynamicElementsObject
  public files: IFile[] = []
  // private _lastFile: IFile | undefined

  public constructor(
    public ext: string = 'md',
    public selectorReference: HTMLElement | Document = document,
  ) {
    this.attributes = this._getAttributes()
    this._listenKeysToShowFileNames()
    console.log('Deprecated, use FileRenderer2')
  }

  /**
   *  Gets element by attribute and gets attributes value
   */
  private _getDynamicElements(
    name: DynamicTypes,
    selectorReference: HTMLElement | Document,
  ): IDynamicElement[] {
    const els = Array.from(selectorReference.querySelectorAll(`[${name}]`)) as HTMLElement[]

    return els.map(this._makeDynamicElement(name))
  }

  private _makeDynamicElement = (type: DynamicTypes, fileName?: string) =>
    (element: HTMLElement): IDynamicElement => ({
      elementCopy: element,
      DOMElement: element,
      type,
      value: fileName || element.getAttribute(type) as string,
    })

  /**
   *  Gets all attributes
   */
  private _getAttributes(
    selectorReference: HTMLElement | Document = this.selectorReference,
  ): IDynamicElementsObject {
    const field = this._getDynamicElements(selectors.field, selectorReference)
    const lines = this._getDynamicElements(selectors.lines, selectorReference)
    const loop = this._getDynamicElements(selectors.loops, selectorReference)
    const external = this._getDynamicElements(selectors.external, selectorReference)
    const prefab = this._getDynamicElements(selectors.prefab, selectorReference)

    return { field, lines, loop, external, prefab }
  }

  /**
   * Gets one attribute
   */
  private _getAttribute(
    type: DynamicTypes,
    selectorReference: HTMLElement | Document = this.selectorReference,
  ) {
    return this._getDynamicElements(type, selectorReference)
  }

  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFile) {
    const matchElWithString = ({ value: name }: IDynamicElement) => name === file.name

    const field = this.attributes.field.filter(matchElWithString)
    const line = this.attributes.lines.filter(matchElWithString)
    const loop = this.attributes.loop.filter(matchElWithString)

    const arr = [
      ...field,
      ...line,
      ...loop,
    ]

    const checkedElements: HTMLElement[] = []

    const elementReferenceHandler = (item: IDynamicElement | undefined) => {
      const dynamicElement = item as IDynamicElement

      if (checkedElements.includes(dynamicElement.elementCopy))
        return dynamicElement

      const passed = this._checkElementInBody(dynamicElement, file)

      checkedElements.push(dynamicElement.elementCopy)

      return passed
        ? dynamicElement
        : this.attributes[dynamicElement.type].find(matchElWithString) as IDynamicElement
    }

    return arr
      .filter((item) => item)
      .map(elementReferenceHandler)
  }

  public render(file: IFile) {
    if (file.rendered) {
      console.warn('file already rendered', file)
    }

    this._checkValidFile(file)

    file.data = SF(file.data)
      .removeComments()
      .string

    file.data = this._preRender(file)

    const _renderDyEl = (dyElement: IDynamicElement) => {
      this._renderByType(dyElement, file)
      this._setFileNameToggle(file.name, dyElement.elementCopy)
    }

    const matchedDyEls = this._matchAttributes(file)

    matchedDyEls.map(_renderDyEl)

    file.rendered = matchedDyEls.length > 0
    // this._lastFile = file

    if (!this.files.includes(file))
      this.files.push(file)

    this.files.map((f) => {
      if (!f.rendered && f.name !== file.name) {
        this.render(f)
      }
    })
  }

  public _preRender(file: IFile) {
    const externalMatches = globalMatch(selectors.externalRGX, file.data)
    let newFileData = file.data

    if (externalMatches) {
      externalMatches.map((matchRGX) => {
        const [match, external, fileName] = matchRGX

        if (fileName) {
          const prefab = this.attributes.prefab.find((p) => p.value === external)
          if (!prefab)
            return console.warn(`External element '[external = ${external}]' not found on file ${file.nameWExt}`)

          const type = prefab.elementCopy.getAttribute('type') as DynamicTypes | undefined
          if (!type) return console.log('prefab has no type')

          const element = prefab.elementCopy.cloneNode(true) as HTMLElement
          element.removeAttribute('prefab')
          element.removeAttribute('type')
          element.setAttribute(type, fileName.trim())

          const newDyEl = this._makeDynamicElement(type, fileName.trim())(element)
          this.attributes[newDyEl.type].push(newDyEl)

          newFileData = newFileData
            .replace(match, element.outerHTML.trim())
            .replace(/>\s+</gu, "><")

          return
        }

        const found = this.attributes.external
          .find(({ value: externalName }) => external === externalName)

        if (found)
          newFileData = newFileData
            .replace(match, found.elementCopy.outerHTML.trim())
            .replace(/>\s+</gu, "><")
        else {
          console.warn(`External element '[external = ${external}]' not found on file ${file.nameWExt}`)

          newFileData = newFileData
            .replace(match, 'NOT FOUND')
        }
      })
    }

    return newFileData
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
  private _renderField = ({ elementCopy: el }: IDynamicElement, { data }: IFile) => {
    el.innerHTML = SF(data)
      .markdown()
      .string
  }

  /**
   *  Renders lines attribute
   */
  private _renderLines = ({ elementCopy: el }: IDynamicElement, { data }: IFile) => {
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
  private _renderLoops = ({ elementCopy: el }: IDynamicElement, file: IFile) => {
    const { data } = file
    const linesArray = getMarkedLines(data)

    const model = el.querySelector(selectors.model)
    if (!model) throw new Error('model not found')

    const modelLineDiv = el.querySelector(selectors.model_line)
    if (!modelLineDiv) throw new Error('Model line not found')

    let newHTML = ''

    const markdownLoopLines = (lineTxt: string) => {
      const div = model.cloneNode(true) as HTMLElement

      const line = div.querySelector(selectors.model_line) as HTMLElement

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

    if (!document.body.contains(elAttr.elementCopy)) {
      console.warn(
        'HTMLElement is not on body, probably lost reference.',
        'Getting fields and lines again, this may cause performance decrease.',
        'Fix your render order.',
        'File:', file.nameWExt,
      )

      this.attributes[elAttr.type] = this._getAttribute(elAttr.type)

      return false
    }

    return true
  }

  private _setFileNameToggle = (fileName: string, el: HTMLElement) => {

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

    let showFiles: HTMLElement[] | undefined
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
