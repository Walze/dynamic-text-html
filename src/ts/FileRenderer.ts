import '../../css/dynamic-files.css'

import { SF } from './StringFormatter'
import { isString } from 'util'

import {
  IFileType, IElAttr,
} from '../types'

const selectors = {
  field: 'field',
  lines: 'lines',
  line: '.d-line',
  external: 'external',
}

export class FileRenderer {

  public fields: IElAttr[] = []
  public lines: IElAttr[] = []

  public files: IFileType[] = []

  public constructor(
    public ext: string = 'md',
    public selectorReference: Element | Document = document,
  ) {
    this.updateFieldAndLines()
    this._listenKeysToShowFileNames()
  }

  /**
   *  gets element by attribute and gets attributes value
   */
  private _getElAttr = (name: string) => Array
    .from(this.selectorReference.querySelectorAll(`[${name}]`))
    .map((el) => ({ el, name: el.getAttribute(name) as string }))

  public updateFieldAndLines() {
    this.fields = this._getElAttr(selectors.field)
    this.lines = this._getElAttr(selectors.lines)
  }

  public findElAttr(name: string) {
    const field = this.fields.find((fieldI) => `${fieldI.name}.${this.ext}` === name)
    const line = this.lines.find((lineI) => `${lineI.name}.${this.ext}` === name)

    return { field, line }
  }

  public render(file: IFileType) {
    this._checkValidFile(file)
    this.files.push(file)

    const data = SF(file.data)
      .removeComments()
      .string

    let { field, line } = this.findElAttr(file.name)

    if (field) {
      const pass = this._checkElementInBody(field.el, file)
      if (!pass) field = this.findElAttr(file.name).field as IElAttr

      this._renderField(field, data)
      this._setFileNameToggle(file.name, field.el)
    }

    if (line) {
      const pass = this._checkElementInBody(line.el, file)
      if (!pass) line = this.findElAttr(file.name).line as IElAttr

      this._renderLines(line, data)
      this._setFileNameToggle(file.name, line.el)
    }

  }

  private _renderField({ el }: IElAttr, data: string) {
    const replacedText = data
      .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(el))
      .replace(/>\s+</g, "><")

    el.innerHTML = SF(replacedText)
      .markdown().string
  }

  private _renderLines = ({ el }: IElAttr, data: string) => {
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

  private _replaceExternal = (el: Element) =>
    (...args: string[]) => {
      const [, external] = args
      const div = el.querySelector(`[${selectors.external} = ${external}]`) as Element
      const newText = div.outerHTML.trim()

      return newText
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

  private _checkValidFile = (file: IFileType) => {

    if (!isString(file.name))
      throw new Error('file name is not string')

    if (!isString(file.data))
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file data is empty')

  }



  private _checkElementInBody(el: Element, file: IFileType) {
    if (!document.body.contains(el)) {
      console.warn('element is not on body, probably lost reference. On file:', file.name)
      console.warn('getting fields and lines again, this may cause performance decrease')
      this.updateFieldAndLines()

      return false
    }

    return true
  }
}
