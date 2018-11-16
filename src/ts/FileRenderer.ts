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


    // show div
    const obj: { [key: string]: boolean } = {
      z: false,
      x: false,
      c: false,
    }

    let showFiles: Element[] | undefined
    let state = false

    window.addEventListener('keydown', ({ key }) => {
      if (obj.hasOwnProperty(key)) obj[key] = true
      if (!showFiles) showFiles = Array.from(document.querySelectorAll(`.show-file-name`))

      if (obj.z && obj.x && obj.c) {
        showFiles.map(el => !state ? el.classList.add('active') : el.classList.remove('active'))

        state = !state

        if (obj.hasOwnProperty(key)) obj[key] = false
      }

      console.log(obj)
    })


    window.addEventListener('keyup', ({ key }) => {
      if (obj.hasOwnProperty(key)) obj[key] = false

      console.log(obj)
    })
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
      const newText = div.outerHTML.trim()

      return newText
    }

  private _displayFileNameToggle = (fileName: string, el: Element) => {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = `<span>${fileName}</span>`

    el.classList.add('dynamic')
    el.appendChild(overlay)

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
