
import marked from 'marked'


export default class Formatter {

  /**
   * @param {{ flag: RegExp, defaultCssSelector: string, triggers: triggerParamType }} options
   */
  constructor(optionsParam) {

    const options = optionsParam || {}
    const optionsObj = {
      flag: options.flag || /\[\[(.+)\]\]/u,
      defaultCssSelector: options.defaultCssSelector || '[field]',
      triggers: options.triggers || {}
    }

    this.flag = optionsObj.flag

    let defaultAddon = null

    if (optionsObj.triggers && optionsObj.triggers.default)
      defaultAddon = optionsObj.triggers.default


    /**
     * @type { triggerType[] }
     */
    this.triggers = [
      ...this._processTriggers(optionsObj.triggers),
      {
        name: 'default',
        fire: this._formatDefault(optionsObj.defaultCssSelector, defaultAddon)
      },
    ]

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

    return (__, file, fileIndex) => {

      const field = fields[fileIndex]
      const defaultInfo = {
        marked: this.mark(file.data),
        raw: file.data
      }

      field.innerHTML = defaultInfo.marked
      this._displayFileNameToggle(file.name, field)

      return defaultInfo

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
   * @param { string } name
   * @returns { triggerType }
   */
  findTrigger(name) {

    return this.triggers
      .find(trigger => trigger.name === name)

  }


  /**
   * @param { string } triggerName
   * @param { fileType } file
   * @param { any[] } args
   */
  pullTrigger(triggerName, file, ...args) {

    if (triggerName === 'default') {

      // Last trigger is always default
      return this.triggers[this.triggers.length - 1].fire(this, file, ...args)

    }

    const trigger = this.findTrigger(triggerName)

    // Takes "name" from "name.txt"
    const selector = `[${file.name.match(/(.+).txt/u)[1]}]`
    const divs = Array
      .from(document.querySelectorAll(selector))
      .map(div => {

        this._displayFileNameToggle(file.name, div)
        return div

      })


    return trigger ? trigger.fire(this, file, divs, ...args) : null

  }


  /**
   * @param { string } text
   */
  matchFlag(text) {

    const matched = text.match(this.flag)

    return matched
      ? matched[1]
      : null

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
   * @returns { [] | [][] }
   */
  everyNthLineBreak(text, everyN = 0) {

    const lines = this
      .replaceFlag(text, '')
      .trim()
      .split(/\r\n|\r|\n/ug)

    /**
     * @type { [][] }
     */
    const groups = []
    let groupsIndex = 0
    let groupItemIndex = 0

    /**
     * Blocks consecutive breaks
     */
    let blocked = false

    lines.map((line, lineI) => {

      let goToNextGroup = false
      const hasText = line !== ''

      // set array if undefined
      if (!Array.isArray(groups[groupsIndex])) groups[groupsIndex] = []

      // checks if N previous items are empty
      let breakCounter = 0;

      [...Array(everyN)].map((__, idx) => {

        const index = lineI - idx

        if (index < 0) {

          breakCounter--
          return

        }

        // lines[lineI - i] === '' ? breakCounter++ : breakCounter--
        breakCounter += lines[lineI - idx] === ''

      })

      // if breakcounter matches param
      goToNextGroup = breakCounter === everyN && everyN !== 0

      // adds line to group item if has text
      if (hasText)
        groups[groupsIndex][groupItemIndex++] = line


      if (!goToNextGroup) blocked = false

      if (goToNextGroup && !blocked) {

        groupsIndex++
        groupItemIndex = 0
        blocked = true

      }

    })

    return everyN === 0
      ? groups[0]
      : groups

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

            const text = this.mark(lines[fatherI][index], removeP)
            child.innerHTML = text

          } else {

            const text = this.mark(lines[index], removeP)
            child.innerHTML = text

          }

        })

      })

    })

  }


  /**
   * @private
   * @param { triggerParamType } triggers
   * @returns { triggerType[] }
   */
  _processTriggers(triggers) {

    return Object
      .keys(triggers)
      .map(triggerName => {

        const triggerFunc = triggers[triggerName]

        if (typeof triggerFunc !== 'function')
          throw new Error('Trigger is not fucntion')

        return {
          name: triggerName,
          fire: triggerFunc
        }

      })

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
