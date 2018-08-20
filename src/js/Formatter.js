
import marked from 'marked'


export default class Formatter {

  /**
   *Creates an instance of Formatter.
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
   * @returns { (_: Formatter, text: string, fileName: string, fieldIndex: number) =>  { file: string; marked: string; raw: string; }}
   */
  formatDefault(defaultCssSelector) {
    const fields = document.querySelectorAll(defaultCssSelector)

    return (_, text, fileName, fieldIndex) => {

      const defaultInfo = {
        file: fileName + '.txt',
        marked: marked(text),
        raw: text
      }

      const field = fields[fieldIndex]

      // this._setFieldNameToggle(defaultInfo.file, defaultInfo.marked, field)
      field.innerHTML = defaultInfo.marked

      return defaultInfo
    }
  }


  /**
   * @param { string } triggerName
   * @param { string } text
   * @param { any[] } args
   */
  fire(triggerName, text, ...args) {
    return this.triggers
      .find(trigger => trigger.name === triggerName)
      .emit(this, text, ...args)
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
  breakLines(text, everyN = 0) {

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

    let lastTrue = false

    lines.map((line, lineI) => {

      let currNPrevEmpty = false
      const hasText = line !== ''

      // set array if undefined
      if (!Array.isArray(groups[groupsIndex])) groups[groupsIndex] = []

      // checks if N previous items are empty
      let breakCounter = 0;

      [...Array(everyN)].map((_, i) => {
        const index = lineI - i

        if (index < 0) return breakCounter--

        // lines[lineI - i] === '' ? breakCounter++ : breakCounter--
        const condition = lines[lineI - i] === ''
        breakCounter += condition
      })

      currNPrevEmpty = (breakCounter === everyN) && everyN !== 0

      if (hasText) {
        groups[groupsIndex][groupItemIndex++] = line
      }

      const goToNextGroup = currNPrevEmpty

      if (!goToNextGroup) lastTrue = false

      if (goToNextGroup && !lastTrue) {
        groupsIndex++
        groupItemIndex = 0
        lastTrue = true
      }

    })

    return everyN !== 0 ? groups : groups[0]
  }


  /**
   * @param { string } marked
   * @param { string } fileName
   * @param { Element } field
   */
  _setFieldNameToggle(fileName, marked, field) {
    let active = false

    field.addEventListener('click', e => {
      if (e.detail !== 4) return

      active = !active

      if (active) field.innerHTML = marked
      else field.innerHTML = fileName
    })
  }


}

