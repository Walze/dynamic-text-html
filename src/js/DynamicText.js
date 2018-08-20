

/**
 *  @typedef { { name: string, data:string } } fileType
 *  @typedef { (ref: Formatter, file: fileType, ...args: any[]) => any  } emit
 *  @typedef { { name: string, emit: emit } } triggerType
 *  @typedef { { [key: string]: emit } } triggerParamType
 */

export default class DynamicText {

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

    this.triggersReturns = this
      ._loadFiles()
      .then(files => this.fireFilesToFormatter(files))
  }

  /**
   * @returns { Promise<fileType[]> }
   */
  async _loadFiles() {
    const promises = Object
      .keys(this.requiredFiles)
      .map(name =>
        fetch(this.requiredFiles[name])
          .then(async response => ({
            name,
            data: await response.text()
          }))
      )

    return this.files = await Promise.all(promises)
  }

  /**
   * @param { fileType[] } files
   */
  fireFilesToFormatter(files) {

    let fieldIndex = 0
    const firedTriggersReturns = []

    for (const file of files) {

      const matchedFlag = this.formatter.matchFlag(file.data)
      let firedTriggersReturn

      if (!matchedFlag)
        firedTriggersReturn = this.formatter.fire('default', file.data, file.name, fieldIndex++)
      else
        firedTriggersReturn = this.formatter.fire(matchedFlag, file.data)

      firedTriggersReturns.push(firedTriggersReturn)
    }

    return firedTriggersReturns
  }
}