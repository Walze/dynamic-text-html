import '../styles/dynamic-files.css'

import { SF } from './StringFormatter'
import { FileFormatter } from './FileFormatter'
import { isString } from 'util';

export class FileRenderer extends FileFormatter {

  public triggers: triggerType
  public ext: string | 'md'

  public constructor(options: FileRendererOptions = {}) {

    super(options.flag, options.defaultCssSelector)

    // sets addon if it exists in triggers
    const defaultAddon = options.triggers && options.triggers.default
      ? options.triggers.default
      : undefined


    this.triggers = {
      ...options.triggers,
      default: this._renderDefaultFactory(this.defaultCssSelector, defaultAddon),
    }

    this.ext = options.ext || 'md'

  }


  public render(file: fileType) {

    this._checkValidFile(file)

    file.data = SF(file.data)
      .removeComments()
      .string()

    // if didn't match, it's a default
    const customTrigger = this.matchFlag(file.data)

    const firedTriggersReturn = customTrigger
      ? this._emitTrigger(customTrigger, file)
      : this._emitTrigger('default', file)

    return firedTriggersReturn

  }

  private _emitTrigger<T>(triggerName: string, file: fileType, ...args: T[]) {


    if (triggerName === 'default') {

      return this.triggers.default(this, file, [], ...args)

    }

    // Takes "name" from "name.extension"
    const regex = new RegExp(`(.+).${this.ext}`, 'u')
    const match = file.name.match(regex)

    if (!match) throw new Error('file did not match RegEx')

    // selects custom divs
    const selector = `[${match[1]}]`
    const divs = Array
      .from(document.querySelectorAll(selector))
      .map((div) => {

        this._displayFileNameToggle(file.name, div)

        return div

      })


    const customTrigger = this.triggers[triggerName]

    return customTrigger ? customTrigger(this, file, divs, ...args) : undefined

  }


  public renderFatherChildren = (
    lines: string[] | string[][],
    fathers: Element[],
    selectors: string[],
  ) => {

    // iterates fathers
    fathers.map((father, fatherI) => {

      // iterates selectors
      selectors.map((selector, selectorI) => {

        const children = Array.from(father.querySelectorAll(selector))

        // iterates children
        children.map((child, childI) => {

          const multiply = childI * selectors.length
          const index = selectorI + multiply

          // if 2 dimentional array test
          const line = Array.isArray(lines[0]) ?
            lines[fatherI][index] as string :
            lines[index] as string

          const markedText = SF(line)
            .markClasses()
            .markdown()
            .removePTag()
            .string()

          child.innerHTML = markedText

        })

      })

    })

  }


  private _renderDefaultFactory(
    defaultCssSelector: string,
    defaultAddon: emitCustom | undefined,
  ) {

    // Only gets run once
    const fields = Array.from(document.querySelectorAll(defaultCssSelector))
    let fieldIndex = 0

    const renderDefault = <T>(_: FileRenderer, file: fileType, ...__: T[]) => {

      const field = fields[fieldIndex++]

      if (defaultAddon) defaultAddon(this, file, [field])

      const markedText = SF(file.data)
        .removeComments()
        .markClasses()
        .markdown()
        .string()

      field.innerHTML = markedText
      this._displayFileNameToggle(file.name, field)

    }

    return renderDefault

  }

  private _displayFileNameToggle(fileName: string, field: Element) {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = fileName

    field.classList.add('dynamic')
    field.insertBefore(overlay, field.firstChild)


    const click = this._FIELD_CLICK(overlay, 2)
    let zPressed = false

    window.addEventListener('keyup', (ev) => {

      if (ev.key === 'z') zPressed = false

    })
    window.addEventListener('keydown', (ev) => {

      if (ev.key === 'z') zPressed = true

    })

    field.addEventListener('pointerup', (ev: MouseEvent) => {

      if (zPressed) click(ev)

    })

    overlay.addEventListener('click', click)

  }

  private _FIELD_CLICK = (
    overlay: Element,
    clickAmount = 3,
  ): ((e: MouseEvent) => void) => {

    let active = false

    return (ev: MouseEvent) => {

      if (ev.detail < clickAmount) return
      ev.stopPropagation()

      active = !active

      if (active)
        overlay.classList.add('active')
      else
        overlay.classList.remove('active')

    }

  }

  private _checkValidFile = (file: fileType) => {

    if (!isString(file.name))
      throw new Error('file name is not string')

    if (!isString(file.data))
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file name is empty')

  }


}
