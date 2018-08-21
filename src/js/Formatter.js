
import marked from 'marked'


export default class Formatter {

  /**
   * @param { RegExp } flag
   * @param { string } defaultCssSelector
   * @param { triggerParamType } triggers
   */
  constructor(flag, defaultCssSelector, triggers) {
    this.flag = flag

    /**
     * @type { triggerType[] }
     */
    this.triggers = [
      ...this._setTriggers(triggers),
      {
        name: 'default',
        emit: this.formatDefault(defaultCssSelector)
      },
    ]

  }


  /**
   * @param { triggerParamType } triggers
   * @returns { triggerType[] }
   */
  _setTriggers(triggers) {

    return Object.keys(triggers).map(triggerName => {
      const triggerFunc = triggers[triggerName]

      if (typeof triggerFunc !== 'function')
        throw new Error('Trigger is not fucntion')

      return {
        name: triggerName,
        emit: triggerFunc
      }
    })
  }


  /**
   * @param {string} defaultCssSelector
   * @returns { (_: Formatter, file: fileType, fieldIndex: number) =>  { file: string; marked: string; raw: string; }}
   */
  formatDefault(defaultCssSelector) {
    const fields = document.querySelectorAll(defaultCssSelector)

    return (_, file, fieldIndex) => {

      const defaultInfo = {
        file: file.name + '.txt',
        marked: marked(file.data),
        raw: file.data
      }

      const field = fields[fieldIndex]

      this._setFieldNameToggle(defaultInfo.file, defaultInfo.marked, field)
      field.innerHTML = defaultInfo.marked

      return defaultInfo
    }
  }


  /**
   * @param { string } triggerName
   * @param { fileType } file
   * @param { any[] } args
   */
  fire(triggerName, file, ...args) {
    return this.triggers
      .find(trigger => trigger.name === triggerName)
      .emit(this, file, ...args)
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
   * @returns { [] | [][] }
   */
  everyNthLineBreak(text, everyN = 0) {

    const lines = this
      .replaceFlag(text, '')
      .trim()
      .split(/\r\n|\r|\n/g)

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

      [...Array(everyN)].map((_, i) => {
        const index = lineI - i

        if (index < 0) return breakCounter--

        // lines[lineI - i] === '' ? breakCounter++ : breakCounter--
        breakCounter += lines[lineI - i] === ''
      })

      // if breakcounter matches param
      goToNextGroup = (breakCounter === everyN) && everyN !== 0

      // adds line to group item if has text
      if (hasText) {
        groups[groupsIndex][groupItemIndex++] = line
      }

      if (!goToNextGroup)
        blocked = false

      if (goToNextGroup && !blocked) {
        groupsIndex++
        groupItemIndex = 0
        blocked = true
      }

    })

    return everyN !== 0 ? groups : groups[0]
  }

  /**
   * @param { any[] } array
   * @param { fileType } file
   * @param { string[] } selectors
   */
  formatFatherChildren(file, array, ...selectors) {

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
          const index = selectorI - 1 + (childI * (selectors.length - 1))

          // if 2 dimentional array
          if (array[0].constructor === Array)
            child.innerHTML = marked(array[fatherI][index])
          else
            child.innerHTML = marked(array[index])

        })

      })

      this._setFieldNameToggle(file.name, father.innerHTML, father)
    })

  }


  /**
   * @param { string } marked
   * @param { string } fileName
   * @param { Element } field
   */
  _setFieldNameToggle(fileName, marked, field) {
    let active = false


    field.addEventListener('click', e => {
      if (e.detail !== 3) return

      console.log(fileName, active)

      active = !active

      if (active) field.innerHTML = marked
      else field.innerHTML = fileName + '.txt'
    })
  }


}

