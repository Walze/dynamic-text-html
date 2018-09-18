import { mapObj } from './helpers'
import StringFormatter from './StringFormatter'
import FileFormatter from './FileFormatter'

export default class Formatter extends FileFormatter {


  /**
   * @param {{ flag: RegExp, defaultCssSelector: string, triggers: triggerParamType }} options
   */
  constructor(options) {

    super(options.flag, options.defaultCssSelector)

    // sets addon if it exists in triggers
    const defaultAddon = options.triggers && options.triggers.default
      ? options.triggers.default
      : null


    /** @type { triggerType } */
    this.triggers = this._bindThisToTriggers(options.triggers)
    this.triggers.default = this._formatDefault(this.defaultCssSelector, defaultAddon).bind(this)

  }


  /**
   * @param { fileType } file
   */
  emitFile(file) {

    const SF = new StringFormatter(file.data)

    file.data = SF.removeComments().string()

    // if didn't match, it's a default
    const customTrigger = this.matchFlag(file.data)

    const firedTriggersReturn = customTrigger
      ? this.emit(customTrigger, file)
      : this.emit('default', file)

    return firedTriggersReturn

  }


  /**
   * @param { string } triggerName
   * @param { fileType } file
   * @param { any[] } args
   */
  emit(triggerName, file, ...args) {

    if (triggerName === 'default') {

      return this.triggers.default(file, ...args)

    }


    // Takes "name" from "name.txt"
    const selector = `[${file.name.match(/(.+).txt/u)[1]}]`
    const divs = Array
      .from(document.querySelectorAll(selector))
      .map(div => {

        this._displayFileNameToggle(file.name, div)
        return div

      })

    const trigger = this.triggers[triggerName]

    return trigger ? trigger(file, divs, ...args) : null

  }


  /**
   * @param { string[] } lines
   * @param { boolean } removeP
   * @param { Element[] } fathers
   * @param { string[] } selectors
   */
  formatFatherChildren(lines, fathers, selectors) {

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
          const SF = lines[0].constructor === Array
            ? new StringFormatter(lines[fatherI][index])
            : new StringFormatter(lines[index])

          const markedText = SF
            .customMarks()
            .mark()
            .removePTag()
            .string()

          child.innerHTML = markedText

        })

      })

    })

  }


  /**
   * @private
   * @param {string} defaultCssSelector
   * @param { null | (fields: Element[]) => any } defaultAddon
   * @returns { emitDefault }
   */
  _formatDefault(defaultCssSelector, defaultAddon) {

    // Only gets run once
    const fields = Array.from(document.querySelectorAll(defaultCssSelector))
    let fieldIndex = 0

    if (defaultAddon) defaultAddon(fields)

    return file => {

      const field = fields[fieldIndex++]

      const markedText = new StringFormatter(file.data)
        .removeComments()
        .customMarks()
        .mark()
        .string()

      field.innerHTML = markedText
      this._displayFileNameToggle(file.name, field)

    }

  }


  /**
   * @private
   * @param { triggerParamType } triggers
   * @returns { triggerType }
   */
  _bindThisToTriggers(triggers) {

    return mapObj(triggers, value => value.bind(this))

  }


  /**
   * @private
   * @param { string } fileName
   * @param { Element } field
   */
  _displayFileNameToggle(fileName, field) {

    const overlay = document.createElement('div')
    overlay.classList.add('show-file-name')
    overlay.innerHTML = fileName

    field.classList.add('dynamic')
    field.insertBefore(overlay, field.firstChild)


    const click = this._onDynamicFieldClick(overlay, 2)
    let zPressed = false

    window.addEventListener('keyup', (ev) => {

      if (ev.key === 'z') zPressed = false

    })
    window.addEventListener('keydown', (ev) => {

      if (ev.key === 'z') zPressed = true

    })

    field.addEventListener('click', ev => {

      if (zPressed) click(ev)

    })

    overlay.addEventListener('click', click)

  }

  /**
   * @private
   * @param { Element } overlay
   * @param { number } [clickAmount = 3]
   * @returns { (e: MouseEvent) => void }
   */
  _onDynamicFieldClick(overlay, clickAmount = 3) {

    let active = false

    return ev => {

      if (ev.detail < clickAmount) return
      ev.stopPropagation()

      active = !active

      if (active)
        overlay.classList.add('active')
      else
        overlay.classList.remove('active')

    }

  }


}
