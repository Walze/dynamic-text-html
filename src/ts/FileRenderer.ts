import '../../css/dynamic-files.css'

import { SF } from './StringFormatter'
import { isString } from 'util'

import {
  IFileType, IElAttr,
} from '../types'

const selectors = {
  field: 'field',
  lines: 'lines',
  loops: 'loop',
  line: '.d-line',
  external: 'external',
}

export class FileRenderer {

  public fields: IElAttr[] = []
  public lines: IElAttr[] = []
  public loops: IElAttr[] = []

  public files: IFileType[] = []

  public constructor(
    public ext: string = 'md',
    public selectorReference: Element | Document = document,
  ) {
    this.updateElements()
    this._listenKeysToShowFileNames()
  }

  /**
   *  gets element by attribute and gets attributes value
   */
  private _getElAttr = (name: string) => Array
    .from(this.selectorReference.querySelectorAll(`[${name}]`))
    .map((el) => ({
      el,
      name: el.getAttribute(name) as string,
    }))

  public updateElements() {
    this.fields = this._getElAttr(selectors.field)
    this.lines = this._getElAttr(selectors.lines)
    this.loops = this._getElAttr(selectors.loops)
  }

  public findElAttr(name: string) {
    const field = this.fields.find((fieldI) => `${fieldI.name}.${this.ext}` === name)
    const line = this.lines.find((lineI) => `${lineI.name}.${this.ext}` === name)
    const loop = this.loops.find((loopI) => `${loopI.name}.${this.ext}` === name)

    return { field, line, loop }
  }

  public render(file: IFileType) {
    this._checkValidFile(file)
    this.files.push(file)

    const data = SF(file.data)
      .removeComments()
      .string

    let { field, line, loop } = this.findElAttr(file.name)

    if (loop) {
      const pass = this._checkElementInBody(loop.el, file)
      if (!pass) loop = this.findElAttr(file.name).loop as IElAttr

      const replacedText = data
        .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(loop.el))
        .replace(/>\s+</g, "><")

      this._renderLoops(loop, replacedText)
      this._setFileNameToggle(file.name, loop.el)
    }

    if (field) {
      const pass = this._checkElementInBody(field.el, file)
      if (!pass) field = this.findElAttr(file.name).field as IElAttr

      const replacedText = data
        .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(field.el))
        .replace(/>\s+</g, "><")

      this._renderField(field, replacedText)
      this._setFileNameToggle(file.name, field.el)
    }

    if (line) {
      const pass = this._checkElementInBody(line.el, file)
      if (!pass) line = this.findElAttr(file.name).line as IElAttr

      const replacedText = data
        .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(line.el))
        .replace(/>\s+</g, "><")

      this._renderLines(line, replacedText)
      this._setFileNameToggle(file.name, line.el)
    }

  }

  private _renderField = ({ el }: IElAttr, data: string) => {
    el.innerHTML = SF(data)
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

  private _renderLoops = ({ el }: IElAttr, data: string) => {
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
        .string

      newHTML += div.outerHTML
    })

    el.innerHTML = newHTML
  }


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
      this.updateElements()

      return false
    }

    return true
  }
}
