
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
    this.default = defaultSelector

    /**
     * @type { [ {name: string, on: (ref: Formatter, text: string) => any} ] }
     */
    this.triggers = this._setTriggers(triggers)

  }

  _setTriggers(triggers) {

    return Object.keys(triggers).map(triggerName => {
      if (triggerName === 'default') return { name: 'default' }


      const triggerFunc = triggers[triggerName]

      if (typeof triggerFunc !== 'function')
        throw new Error('Trigger is not fucntion')

      return {
        name: triggerName,
        on: triggerFunc
      }
    })
  }

  formatDefault(fileName, text) {
    return {
      file: fileName + '.txt',
      marked: marked(text),
      raw: text
    }
  }

  fire(triggerName, text) {
    for (const name of Object.keys(this.triggers)) {
      if (triggerName !== name) continue

      this.triggers[triggerName].on(this, text)

      return
    }
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
    const match = text.match(/\[\[(.+)\]\]/)

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
}


export default class DynamicText {

  /**
   * Creates an instance of DynamicText.
   * @param {Formatter} customFormatter
   * @memberof DynamicText
   */
  constructor(customFormatter) {
    this.formatter = customFormatter
    this.campos = Array.from(document.querySelectorAll(customFormatter.default))

    this.files = require('../textos/**.txt')
    this.texts = []

    this._loadTexts().then(() => this._render())
  }

  /**
   * @param {Element} campo
   * @param {number} i
   * @memberof Campos
   */
  _setCampoNumToggle(campo, i) {
    const string = this.texts[i].file
    let active = false

    campo.addEventListener('click', e => {
      if (e.detail !== 4) return

      active = !active

      if (active) campo.innerHTML = string
      else campo.innerHTML = this.texts[i].marked
    })
  }

  async _loadTexts() {
    const txts = []

    for (const nome of Object.keys(this.files)) {

      const text = await fetch(this.files[nome]).then(resp => resp.text())

      if (!this.formatter.getFlag(text))
        txts.push(this.formatter.formatDefault(nome, text))
      else {
        const trigger = this.formatter.getFlag(text)

        console.log('should not push', trigger, this.formatter.fire(trigger, text))
      }

    }

    this.texts = txts

    return txts
  }

  _render() {
    if (!this.texts.length)
      throw alert('Nenhum arquivo de text foi encontrado na pasta')

    this.campos.map((campo, i) => {
      this._setCampoNumToggle(campo, i)
      campo.innerHTML = this.texts[i].marked
    })
  }
}