import TextReplacer from './TextReplacer'


export default class Formatter {


  /**
   * @param {{ flag: RegExp, defaultCssSelector: string, triggers: triggerParamType }} optionsParam
   */
  constructor(optionsParam) {

    const options = optionsParam || {}
    const optionsObj = {
      flag: options.flag || /\[\[(.+)\]\]\r\n|\r|\n/u,
      defaultCssSelector: options.defaultCssSelector || '[field]',
      triggers: options.triggers || {}
    }

    this.flag = optionsObj.flag

    let defaultAddon = null

    if (optionsObj.triggers && optionsObj.triggers.default)
      defaultAddon = optionsObj.triggers.default


    /**
     * @type { triggerType }
     */
    this.triggers = this._bindThisToTriggers(optionsObj.triggers)
    this.triggers.default = this._formatDefault(optionsObj.defaultCssSelector, defaultAddon).bind(this)

  }


  /**
   * @param { fileType[] } files
   */
  emitFiles(files) {

    let defaultFileIndex = 0
    const firedTriggersReturns = []

    for (const file of files) {

      let firedTriggersReturn = null

      // if didn't match, it's a default
      const customTrigger = this.matchFlag(file.data)

      if (customTrigger)
        firedTriggersReturn = this.emit(customTrigger, file)
      else
        firedTriggersReturn = this.emit('default', file, defaultFileIndex++)

      firedTriggersReturns.push(firedTriggersReturn)

    }

    return firedTriggersReturns

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
   * @param { string } text
   */
  matchFlag(text) {

    const matched = text.match(this.flag)

    return matched ? matched[1] : null

  }


  /**
   * @param { string } text
   * @param { string } replaceWith
   */
  replaceFlag(text, replaceWith = '\n') {

    return text.replace(this.flag, replaceWith)

  }


  /**
   * @param { string } text
   * @returns { string[] }
   */
  everyNthLineBreak(text, everyN = 0) {

    const lines = this
      .replaceFlag(text, '')
      .trim()
      .split(/\r\n|\r|\n/ug)

    /** @type { string[] } */
    const groups = []

    /** Blocks consecutive breaks */
    let blocked = false

    let groupsIndex = 0
    let breakCounter = 0

    lines.map((line) => {

      let goToNextGroup = false
      const isEmpty = line === ''

      if (!groups[groupsIndex])
        groups[groupsIndex] = ''

      if (isEmpty) breakCounter++
      else breakCounter = 0

      // if breakcounter matches param
      goToNextGroup = breakCounter === everyN && everyN !== 0

      groups[groupsIndex] += `${line}\r\n`

      if (!goToNextGroup)
        blocked = false

      if (goToNextGroup && !blocked) {

        groupsIndex++
        blocked = true

      }

    })

    return everyN === 0 ? groups[0] : groups

  }


  /**
   * @param { string[] } lines
   * @param { boolean } removeP
   * @param { Element[] } fathers
   * @param { string[] } selectors
   */
  formatFatherChildren(lines, fathers, selectors, removeP = false) {

    // iterates fathers
    fathers.map((father, fatherI) => {

      // iterates selectors
      selectors.map((selector, selectorI) => {

        const children = Array.from(father.querySelectorAll(selector))

        // iterates children
        children.map((child, childI) => {

          const multiply = childI * selectors.length
          const index = selectorI + multiply

          // if 2 dimentional array
          if (lines[0].constructor === Array) {

            const text = lines[fatherI][index]
            let markedText = TextReplacer.customMarks(text)
            markedText = TextReplacer.mark(markedText, removeP)
            child.innerHTML = markedText

          } else {

            const text = lines[index]
            let markedText = TextReplacer.customMarks(text)
            markedText = TextReplacer.mark(markedText, removeP)
            child.innerHTML = markedText

          }

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

    if (defaultAddon) defaultAddon(fields)

    return (file, fileIndex) => {

      const field = fields[fileIndex]
      const markedText = TextReplacer.customMarks(TextReplacer.mark(file.data))

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

    for (const prop in triggers)
      triggers[prop] = triggers[prop].bind(this)

    return triggers

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
