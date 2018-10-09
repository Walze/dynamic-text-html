import '../../public/css/dynamic-files.css'

import { SF } from './StringFormatter'
import { FileFormatter } from './FileFormatter'
import { isString } from 'util'

import {
  ITriggerType,
  IFileRendererOptions,
  IFileType,
  triggerFunction,
  ITriggerElements,
} from '../types'

import { mapObjToArray } from './helpers'


export class FileRenderer extends FileFormatter {

  // public triggers: ITriggerType
  // public triggerElements: ITriggerElements

  public triggers: {
    names: string[];
    elements: ITriggerElements;
    callbacks: ITriggerType;
  }

  public ext: string | 'md'

  private _defaultIndex = 0
  private _customIndex = 0

  public constructor(options: IFileRendererOptions = {}) {

    super(options.flag, options.defaultCssSelector)

    // sets addon if it exists in triggers
    const defaultAddon = options.triggers && options.triggers.default
      ? options.triggers.default
      : undefined



    const elements = this._getTriggerElements()
    const callbacks = {
      ...options.triggers,
      default: this._renderDefaultFactory(defaultAddon),
    }

    const names = mapObjToArray(callbacks, (_, prop) => prop)


    this.triggers = { names, elements, callbacks }


    this.ext = options.ext || 'md'
  }


  private _getTriggerElements = () => {
    const elements: ITriggerElements = { defaults: [], custom: {} }

    Array
      .from(document.querySelectorAll('[trigger]'))
      .map((el) => {

        const name = el.getAttribute('trigger') as string

        if (name === '' || name === 'default')
          elements.defaults.push(el)
        else {
          if (!elements.custom[name])
            elements.custom[name] = []

          elements.custom[name].push(el)
        }
      });

    return elements
  }

  public render(file: IFileType) {

    this._checkValidFile(file)

    file.data = SF(file.data)
      .removeComments()
      .string()

    // if didn't match, it's a default
    const triggerName = this.matchFlag(file.data)

    const isInsideNames = this.triggers.names.find((name) => triggerName === name)
    const isDefault = triggerName === '' || triggerName === 'default' || !triggerName

    if (!isInsideNames && !isDefault)
      return console.error('Trigger not found:', triggerName)

    return this._triggerRender(triggerName, file)
  }


  private _triggerRender<T>(triggerName: string | undefined, file: IFileType, ...args: T[]) {

    if (!triggerName) {

      return this.triggers.callbacks.default(
        file,
        this.triggers.elements.defaults[this._defaultIndex++],
        ...args,
      )
    }


    // takes "name" from "name.extension"
    const regex = new RegExp(`(.+).${this.ext}`, 'u')
    const match = file.name.match(regex)
    if (!match) throw new Error('file did not match RegEx')

    const div = this.triggers.elements.custom[triggerName][this._customIndex++]

    this._displayFileNameToggle(file.name, div)


    const customTrigger = this.triggers.callbacks[triggerName]

    // removing flag from file data
    file.data = this.replaceFlag(file.data, '')

    return customTrigger
      ? customTrigger(file, div, ...args)
      : undefined

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

  private _renderDefaultFactory(
    defaultAddon: triggerFunction | undefined,
  ) {

    const renderDefault: triggerFunction = (file: IFileType, field: Element) => {

      if (defaultAddon) defaultAddon(file, field)

      const markedText = SF(file.data)
        .removeComments()
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
