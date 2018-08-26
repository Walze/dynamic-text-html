
import marked from 'marked'


export default class Formatter {

  /**
   * @param {{ flag: RegExp, defaultCssSelector: string, triggers: triggerParamType }} options
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
  fireFiles(files) {

    let defaultFileIndex = 0
    const firedTriggersReturns = []

    for (const file of files) {

      let firedTriggersReturn = null

      // if didn't match, it's a default
      const customTrigger = this.matchFlag(file.data)

      if (customTrigger)
        firedTriggersReturn = this.pullTrigger(customTrigger, file)
      else
        firedTriggersReturn = this.pullTrigger('default', file, defaultFileIndex++)

      firedTriggersReturns.push(firedTriggersReturn)

    }

    return firedTriggersReturns

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
      const markedText = this.mark(file.data)

      field.innerHTML = markedText
      this._displayFileNameToggle(file.name, field)

    }

  }

  /**
   * @param { string } text
   * @param { boolean } removeP
   */
  mark(text, removeP = false) {

    const markedText = marked(text)

    if (removeP)
      return this.removeP(markedText)

    return markedText

  }


  /**
   * @param { string } triggerName
   * @param { fileType } file
   * @param { any[] } args
   */
  pullTrigger(triggerName, file, ...args) {

    if (triggerName === 'default') {

      // Last trigger is always default
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
   */
  removeP(text) {

    return text
      .replace(/<p>/gu, '')
      .replace(/<\/p>/gu, '')

  }


  /**
   * @param { string } text
   * @returns { string[] }
   */
  everyNthLineBreak(text, everyN = 0) {

    const lines = this
      .replaceFlag(text, '')
      .split(/\r\n|\r|\n/ug)

    if (everyN === 1)
      return lines.filter(line => line !== '')

    /**
     * @type { string[] }
     */
    const groups = []
    let groupsIndex = 0

    /**
     * Blocks consecutive breaks
     */
    let blocked = false
    let breakCounter = 0

    lines.map((line) => {

      let goToNextGroup = false
      const isEmpty = line === ''

      if (!groups[groupsIndex])
        groups[groupsIndex] = ''

      // checks if N previous items are empty

      if (isEmpty) breakCounter++
      else breakCounter = 0

      // if (breakCounter > everyN) groupsIndex--

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
            const markedText = this.mark(text, removeP)
            child.innerHTML = markedText

          } else {

            const text = lines[index]
            const markedText = this.mark(text, removeP)
            child.innerHTML = markedText

          }

        })

      })

    })

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


    const click = this.onDynamicFieldClick(overlay, 2)
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
   * @param { Element } overlay
   * @param { number } [clickAmount = 3]
   * @returns { (e: MouseEvent) => void }
   */
  onDynamicFieldClick(overlay, clickAmount = 3) {

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
