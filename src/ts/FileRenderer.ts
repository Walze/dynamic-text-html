import '../../public/css/dynamic-files.css'

import { SF } from './StringFormatter'
import { FileFormatter } from './FileFormatter'
import { isString } from 'util'

import {
  IFileType, IElAttr,
} from '../types'

// tslint:disable-next-line:max-classes-per-file


export class FileRenderer extends FileFormatter {

  public fields: IElAttr[]
  public lines: IElAttr[]

  public files: IFileType[] = []

  public constructor(
    public ext: string = 'md',
  ) {
    super()

    this.fields = this._getElAttr('field')
    this.lines = this._getElAttr('lines')
  }

  private _getElAttr = (name: string) => Array
    .from(document.querySelectorAll(`[${name}]`))
    .map((el) => ({
      el,
      name: el.getAttribute(name) as string,
    }))

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
      .string()

    const { field, line } = this.findElAttr(file.name)

    if (field) {
      this._renderField(field, data)
      this._displayFileNameToggle(file.name, field.el)
    }

    if (line) {
      this._renderLines(line, data)
      this._displayFileNameToggle(file.name, line.el)
    }

  }

  private _renderField({ el }: IElAttr, data: string) {
    const replacedText = data
      .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(el))
      .replace(/>\s+</g, "><")

    el.innerHTML = SF(replacedText)
      .markdown()
      .string()
  }

  private _renderLines = ({ el }: IElAttr, data: string) => {
    const linesArray = SF(data)
      .everyNthLineBreak(1)
      .map((line) =>
        SF(line)
          .markdown()
          .removePTag()
          .string()
          .trim(),
      )


    Array
      .from(el.querySelectorAll('[line]'))
      .map((line, i) => line.innerHTML = linesArray[i])
  }

  private _replaceExternal = (el: Element) =>
    (...args: string[]) => {
      const [, external] = args
      const div = el.querySelector(`[external = ${external}]`) as Element
      const newText = div.innerHTML.trim()

      return newText
    }

  private _displayFileNameToggle(fileName: string, el: Element) {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = fileName

    el.classList.add('dynamic')
    el.insertBefore(overlay, el.firstChild)


    const click = this._fieldClickFactory(overlay)

    let zPressed = false

    window.addEventListener('keyup', (ev) => {
      const isNotZ = ev.key !== 'z'

      if (isNotZ) return

      zPressed = isNotZ
    })
    window.addEventListener('keydown', (ev) => zPressed = ev.key === 'z')

    el
      .addEventListener('pointerup', (ev) => zPressed ? click(ev) : undefined)

  }

  private _fieldClickFactory = (
    overlay: Element,
  ) => {

    let active = false

    return (ev: Event) => {

      ev.preventDefault()
      ev.stopPropagation()

      active = !active

      if (active)
        overlay.classList.add('active')
      else
        overlay.classList.remove('active')

    }

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


}
