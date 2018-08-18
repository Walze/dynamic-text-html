
import marked from 'marked'




/**
 *  @typedef { { name: string, data:string } } fileType
 *  @typedef { (ref: Formatter, file: fileType, ...args: any[]) => void  } emit
 *  @typedef { { name: string, emit: emit } } triggerType
 *  @typedef { { [key: string]: emit } } triggerParamType
 */

export class Formatter {

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
   * @returns { (_: Formatter, text: string, fileName: string, campoIndex: string) =>  { file: string; marked: string; raw: string; }}
   */
  formatDefault(defaultCssSelector) {
    return (_, text, fileName, campoIndex) => {

      const defaultInfo = {
        file: fileName + '.txt',
        marked: marked(text),
        raw: text
      }

      const campos = document.querySelectorAll(defaultCssSelector)
      const campo = campos[campoIndex]


      this._setCampoNameToggle(defaultInfo, campo)
      campo.innerHTML = defaultInfo.marked

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
   * @param { string[] } array
   * @param { string } fatherSelector
   * @param { string } childSelector
   */
  formatFatherChild(array, fatherSelector, childSelector) {
    for (const father of document.querySelectorAll(fatherSelector)) {
      let index = 0

      for (const child of father.querySelectorAll(childSelector))
        child.innerHTML = array[index++]
    }
  }


  /**
   * @param { string } text
   */
  matchFlag(text) {
    const match = text.match(this.flag)

    return match ? match[1] : null
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
  breakLines(text) {
    return this.replaceFlag(text)
      .split(/\r\n|\r|\n/g)
      .filter(txt => !!txt)
  }


  /**
   * @param {*} info
   * @param { Element } campo
   */
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
   * @param {Formatter} formatter
   */
  constructor(formatter) {
    this.formatter = formatter

    this.requiredFiles = require('../textos/**.txt')

    if (!Object.keys(this.requiredFiles).length)
      throw alert('Nenhum arquivo de text foi encontrado na pasta')

    /**
     * @type { fileType[] }
     */
    this.files = []

    this._loadFiles()
      .then(files => {
        files.map((file, i) => this.defaultOrCustom(file, i))
      })
  }

  /**
   * @returns { fileType[] }
   */
  async _loadFiles() {
    const files = []

    for (const name of Object.keys(this.requiredFiles)) {
      const data = await fetch(this.requiredFiles[name]).then(resp => resp.text())

      files.push({ name, data })
    }

    this.files = files

    return files
  }

  /**
   * @param { fileType } file
   * @param { number } index
   */
  defaultOrCustom(file, index) {
    if (!this.formatter.matchFlag(file.data))
      this.formatter.fire('default', file.data, file.name, index)
    else
      this.formatter.fire(
        this.formatter.matchFlag(file.data),
        file.data,
      )
  }

}