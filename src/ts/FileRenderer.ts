import '../../public/css/dynamic-files.css'

import { SF } from './StringFormatter'
import { FileFormatter } from './FileFormatter'
import { isString } from 'util'

import {
  IFileRendererOptions,
  IFileType,
  ITriggerType,
  triggerFunction,
  ITriggerElements,
} from '../types'

// tslint:disable-next-line:max-classes-per-file

interface IFieldType {
  name: string;
  el: Element;
}

export class FileRenderer extends FileFormatter {

  public fields: IFieldType[]
  public files: IFileType[] = []

  public constructor(
    public ext: string = 'md',
  ) {
    super()

    this.fields = Array
      .from(document.querySelectorAll('[field]'))
      .map((el) => ({
        el,
        name: el.getAttribute('field') as string,
      }))

    console.log(this)
  }

  public findField(name: string) {
    return this.fields.find((field) => `${field.name}.${this.ext}` === name) as IFieldType
  }

  public render(file: IFileType) {
    this.files.push(file)

    const field = this.findField(file.name)

    if (!field)
      return console.warn(`No field found on name '${file.name}'`)

    const replacedText = file.data.replace(/\[\[(.+)\]\]/gu, (...args) => {
      const external = args[1]
      const div = field.el.querySelector(`[external = ${external}]`) as Element

      return div.innerHTML.trim()
    })

    field.el.innerHTML = SF(replacedText)
      .markdown()
      .string()
  }

  /**
   * Renders each line to its respective selector inside of parent
   */
  public renderMultipleLines = (
    parent: Element,
    lines: string[],
    selectors: string[],
  ) => {

    // iterates selectors
    selectors.map((selector, selectorI) => {

      const children = Array.from(parent.querySelectorAll(selector))
      if (!children || children.length < 1) return

      children.map((child, childI) => {

        const multiply = childI * selectors.length
        const index = selectorI + multiply

        child.innerHTML = SF(lines[index])
          .makeInlineMarkedText()

      })

    })

  }

  private _displayFileNameToggle(fileName: string, field: Element) {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = fileName

    field.classList.add('dynamic')
    field.insertBefore(overlay, field.firstChild)


    const click = this._fieldClickFactory(overlay)

    let zPressed = false

    window.addEventListener('keyup', (ev) => {
      const isNotZ = ev.key !== 'z'

      if (isNotZ) return

      zPressed = isNotZ
    })
    window.addEventListener('keydown', (ev) => zPressed = ev.key === 'z')

    field
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
