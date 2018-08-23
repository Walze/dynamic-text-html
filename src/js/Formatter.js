
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

    /**
     * @type { triggerType[] }
     */
    this.triggers = [
      ...this._processTriggers(optionsObj.triggers),
      {
        name: 'default',
        fire: this._formatDefault(optionsObj.defaultCssSelector)
      },
    ]

  }


  /**
   * @private
   * @param {string} defaultCssSelector
   * @returns { (_: Formatter, file: fileType, fileIndex: number) => { file: string; marked: string; raw: string; }}
   */
  _formatDefault(defaultCssSelector) {

    const fields = document.querySelectorAll(defaultCssSelector)

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
   */
  mark(text) {

    return marked(text)

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

    const trigger = this.findTrigger(triggerName)
    return trigger ? trigger.fire(this, file, ...args) : null

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
   * @param { fileType } file
   * @param { string[] } selectors 1st selector is just for selecting the father, others are used in txt files
   */
  formatFatherChildren(file, lines, ...selectors) {

    // gets the fathers
    const fathers = Array.from(document.querySelectorAll(selectors[0]))

    // iterates fathers
    fathers.map((father, fatherI) => {

      // iterates selectors
      selectors.map((selector, selectorI) => {

        // if selector is father selector, return
        if (selectorI === 0) return

        const children = Array.from(father.querySelectorAll(selector))

        // iterates children
        children.map((child, childI) => {

          // -1 because the first is the fathers selector
          const multiply = childI * (selectors.length - 1)
          const index = selectorI - 1 + multiply

          // if 2 dimentional array
          if (lines[0].constructor === Array)
            child.innerHTML = this.mark(lines[fatherI][index])
          else
            child.innerHTML = this.mark(lines[index])

        })

      })

      this._displayFileNameToggle(file.name, father)

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
