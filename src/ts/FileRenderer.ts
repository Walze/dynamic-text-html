import '../../css/dynamic-files.css'

import { SF } from './StringFormatter'

import {
  IFileType,
  IAttributeElement,
  Attribute,
  IAttributes,
} from '../types'

const selectors = {
  field: Attribute.field,
  lines: Attribute.lines,
  loops: Attribute.loop,
  line: '[line]',
  external: 'external',
}

export class FileRenderer {

  public attributes: IAttributes
  public files: IFileType[] = []

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
  private _getAttributeElements = (name: Attribute): IAttributeElement[] =>
    Array
      .from(this.selectorReference.querySelectorAll(`[${name}]`))
      .map((el) => ({
        el,
        name,
        value: el.getAttribute(name) as string,
      }))

  /**
   *  Gets all attributes
   */
  private _getAttributes(): IAttributes {
    const field = this._getAttributeElements(selectors.field)
    const lines = this._getAttributeElements(selectors.lines)
    const loop = this._getAttributeElements(selectors.loops)

    return { field, lines, loop }
  }

  /**
   * Gets one attribute
   */
  private _getAttribute(type: Attribute) {
    return this._getAttributeElements(type)
  }

  /**
   * Returns all attributes that matches in file name
   */
  private _matchAttributes(file: IFileType) {
    const match = ({ value: name }: IAttributeElement) => `${name}.${this.ext}` === file.name

    const field = this.attributes.field.find(match)
    const line = this.attributes.lines.find(match)
    const loop = this.attributes.loop.find(match)

    const arr = [
      field,
      line,
      loop,
    ]

    return arr
      .filter((item) => item)
      .map((item) => {
        const elAttr = item as IAttributeElement
        const passed = this._checkElementInBody(elAttr, file)

        return passed
          ? elAttr
          : this.attributes[elAttr.name].find(match) as IAttributeElement
      })
  }

  public render(file: IFileType) {
    this._checkValidFile(file)
    this.files.push(file)

    const data = SF(file.data)
      .removeComments()
      .string

    const elAttrs = this._matchAttributes(file)

    elAttrs.map((elAttr) => {

      const replacedText = data
        .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(elAttr.el))
        .replace(/>\s+</g, "><")

      // tslint:disable-next-line:switch-default
      switch (elAttr.name) {
        case Attribute.field:
          this._renderField(elAttr, replacedText)
          break

        case Attribute.lines:
          this._renderLines(elAttr, replacedText)
          break

        case Attribute.loop:
          this._renderLoops(elAttr, replacedText)
      }

      this._setFileNameToggle(file.name, elAttr.el)
    })

  }

  /**
   *  Renders field attribute
   */
  private _renderField = ({ el }: IAttributeElement, data: string) => {
    el.innerHTML = SF(data)
      .markdown()
      .string
  }

  /**
   *  Renders lines attribute
   */
  private _renderLines = ({ el }: IAttributeElement, data: string) => {
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
  private _renderLoops = ({ el }: IAttributeElement, data: string) => {
    const linesArray = SF(data)
      .everyNthLineBreak(1)
      .map((lineTxt) =>
        SF(lineTxt)
          .markdown()
          .removePTag()
          .string
          .trim(),
      )

    const model = el.querySelector('.model')
    if (!model) throw new Error('model not found')

    const modelLineDiv = el.querySelector('.model-line')
    if (!modelLineDiv) throw new Error('model-line not found')

    let newHTML = ''

    linesArray.map((lineTxt) => {
      const div = model.cloneNode(true) as Element
      const line = div.querySelector('.model-line') as Element

      line.innerHTML = SF(lineTxt)
        .markdown()
        .string

      newHTML += div.outerHTML
    })

    el.innerHTML = newHTML
  }


  /**
   *  Function generator that replaces the [[external]] tag
   */
  private _replaceExternal = (el: Element) =>
    (...args: string[]) => {
      const [, external] = args
      const div = el.querySelector(`[${selectors.external} = ${external}]`) as Element
      if (!div) {
        console.warn(`External element '[${selectors.external} = ${external}]' not found`)

        return ''
      }

      const newText = div.outerHTML.trim()

      return newText
    }

  /**
   *  Checks is the file is valid
   */
  private _checkValidFile = (file: IFileType) => {

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
  private _checkElementInBody(elAttr: IAttributeElement, file: IFileType) {

    if (!document.body.contains(elAttr.el)) {
      console.warn(
        'Element is not on body, probably lost reference.',
        'Getting fields and lines again, this may cause performance decrease.',
        'On file:', file.name,
      )

      this.attributes[elAttr.name] = this._getAttribute(elAttr.name)

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
