import '../../css/dynamic-files.css'

import { SF } from './StringFormatter'

import {
  IFileType, IElAttr, ElAttrType,
} from '../types'

const selectors = {
  field: ElAttrType.field,
  lines: ElAttrType.lines,
  loops: ElAttrType.loop,
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
  private _getElAttr = (name: ElAttrType): IElAttr[] => Array
    .from(this.selectorReference.querySelectorAll(`[${name}]`))
    .map((el) => ({
      el,
      type: name,
      name: el.getAttribute(name) as string,
    }))

  public updateElements() {
    this.fields = this._getElAttr(selectors.field)
    this.lines = this._getElAttr(selectors.lines)
    this.loops = this._getElAttr(selectors.loops)
  }

  public findElAttr(file: IFileType): IElAttr | undefined {
    const field = this.fields.find((fieldI) => `${fieldI.name}.${this.ext}` === file.name)
    const line = this.lines.find((lineI) => `${lineI.name}.${this.ext}` === file.name)
    const loop = this.loops.find((loopI) => `${loopI.name}.${this.ext}` === file.name)

    const found = [field, line, loop].find((e) => !!e)
    if (!found) return undefined

    return this._checkElementInBody(found, file)
  }

  public render(file: IFileType) {
    this._checkValidFile(file)
    this.files.push(file)

    const data = SF(file.data)
      .removeComments()
      .string

    const elAttr = this.findElAttr(file)
    if (!elAttr) return console.warn('element not found with file', file.name)

    const replacedText = data
      .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(elAttr.el))
      .replace(/>\s+</g, "><")

    // tslint:disable-next-line:switch-default
    switch (elAttr.type) {
      case ElAttrType.field:
        this._renderField(elAttr, replacedText)
        break

      case ElAttrType.lines:
        this._renderLines(elAttr, replacedText)
        break

      case ElAttrType.loop:
        this._renderLoops(elAttr, replacedText)
    }

    this._setFileNameToggle(file.name, elAttr.el)

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

    if (typeof file.name !== 'string')
      throw new Error('file name is not string')

    if (typeof file.data !== 'string')
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file data is empty')

  }



  private _checkElementInBody(elAttr: IElAttr, file: IFileType) {
    if (!document.body.contains(elAttr.el)) {
      console.warn(
        'element is not on body, probably lost reference.',
        'Getting fields and lines again, this may cause performance decrease.',
        'On file:',
        file.name,
      )

      this.updateElements()

      return this.findElAttr(file)
    }

    return elAttr
  }
}
