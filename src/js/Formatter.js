
import marked from 'marked'

export default class Formatter {

  /**
   *Creates an instance of Formatter.
   * @param {RegExp} flag
   * @param {string} defaultCssSelector
   * @param { triggerParamType } triggers
   * @memberof Formatter
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
   * @param {triggerParamType} triggers
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

      this._setFieldNameToggle(defaultInfo, field)
      field.innerHTML = defaultInfo.marked

      return defaultInfo
    }
  }


  /**
   * @param {string} triggerName
   * @param {string} text
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
   */
  breakLines(text, everyN = 2) {

    const lines =
      this.replaceFlag(text)
        .split(/\r\n|\r|\n/g)

    /**
     * @type { [][] }
     */
    const arr = []
    let arrIndex = 0
    let arrArrIndex = 0

    let prevLine = null
    let lastTrue = false;

    console.log(
      lines,
      lines.map((line, lineI) => {

        let arrItem = arr[arrIndex]

        if (!Array.isArray(arrItem)) arrItem = []

        let nPrevEmpty = false;
        const currentEmpty = line !== '';

        // checa se os N ultimos itens são vazios
        [...Array(everyN - 1)].map((_, i) => {
          const index = lineI - (i + 1)

          if (index < 0) return nPrevEmpty = false

          lines[index] === '' ? nPrevEmpty = true : nPrevEmpty = false
        })

        console.log(lineI, line, nPrevEmpty && !currentEmpty, '||', arrIndex, arrArrIndex)

        if (currentEmpty) {
          arrItem[arrArrIndex++] = line
        }

        arr[arrIndex] = arrItem

        const nextIndex = (nPrevEmpty && !currentEmpty)

        if (!nextIndex) {
          lastTrue = false
        }

        if (nextIndex && !lastTrue) {
          arrIndex++
          lastTrue = true
        }
        prevLine = line
      }),
      arr
    )

    return this
      .replaceFlag(text)
      .split(/\r\n|\r|\n/g)
      .filter(txt => !!txt)
  }


  /**
   * @param {*} info
   * @param { Element } field
   */
  _setFieldNameToggle(info, field) {
    let active = false

    field.addEventListener('click', e => {
      if (e.detail !== 4) return

      active = !active

      if (active) field.innerHTML = info.marked
      else field.innerHTML = info.file
    })
  }


}

