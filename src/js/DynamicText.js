
import marked from 'marked'

export class Formatter {

  /**
   * Creates an instance of CustomFormatter.
   *
   * @param {RegExp} flag
   * @param {string} defaultSelector
   * @param { { [key: string]: (ref: Formatter, text: string) => any } } triggers
   */
  constructor(flag, defaultSelector, triggers) {
    this.flag = flag

    /**
     * @type { [ {name: string, on: (ref: Formatter, text: string) => any} ] }
     */
    this.triggers = [
      {
        name: 'default',
        on: this.formatDefault(defaultSelector)
      },
      ...this._setTriggers(triggers),
    ]

  }

  _setTriggers(triggers) {

    return Object.keys(triggers).map(triggerName => {
      const triggerFunc = triggers[triggerName]

      if (typeof triggerFunc !== 'function')
        throw new Error('Trigger is not fucntion')

      return {
        name: triggerName,
        on: triggerFunc
      }
    })
  }

  formatDefault(defaultSelector) {
    return (_, file) => {

      const defaultInfo = {
        file: file.name + '.txt',
        marked: marked(file.data),
        raw: file.data
      }

      Array.from(document.querySelectorAll(defaultSelector))
        .map((campo, i) => {
          this._setCampoNameToggle(defaultInfo, campo, i)
          campo.innerHTML = defaultInfo.marked
        })

      return defaultInfo
    }
  }

  fire(triggerName, text) {
    return this.triggers
      .find(trigger => trigger.name == triggerName)
      .on(this, text)
  }

  formatFatherChild(array, fatherSelector, childSelector) {
    for (const father of document.querySelectorAll(fatherSelector)) {
      let index = 0

      for (const child of father.querySelectorAll(childSelector))
        child.innerHTML = array[index++]
    }
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  getFlag(text) {
    const match = text.match(this.flag)

    return match ? match[1] : null
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  replaceFlag(text, replaceWith = '\n') {
    return text.replace(this.flag, replaceWith)
  }

  breakLines(text) {
    return this.replaceFlag(text)
      .split(/\r\n|\r|\n/g)
      .filter(txt => !!txt)
  }


  _setCampoNameToggle(info, campo) {
    let active = false

    campo.addEventListener('click', e => {
      if (e.detail !== 4) return

      active = !active

      if (active) campo.innerHTML = info.marked
      else campo.innerHTML = info.file
    })
  }

}


export class DynamicText {

  /**
   * Creates an instance of DynamicText.
   * @param {Formatter} customFormatter
   * @memberof DynamicText
   */
  constructor(customFormatter) {
    this.formatter = customFormatter

    this.requiredFiles = require('../textos/**.txt')
    this.files = []

    this._loadFiles()
      .then(files => {
        files.map(file => this.defaultOrCustom(file))
      })
  }

  async _loadFiles() {
    const files = []

    for (const name of Object.keys(this.requiredFiles)) {
      files.push(
        {
          name,
          data: await fetch(this.requiredFiles[name]).then(resp => resp.text())
        }
      )
    }

    this.files = files

    return files
  }

  defaultOrCustom(file) {
    if (!this.formatter.getFlag(file.data))
      this.formatter.fire('default', file)
    else
      this.formatter.fire(
        this.formatter.getFlag(file.data),
        file.data,
      )
  }

  _render() {
    if (!this.files.length)
      throw alert('Nenhum arquivo de text foi encontrado na pasta')


  }
}