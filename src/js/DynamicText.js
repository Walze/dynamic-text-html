

export default class DynamicText {

  /**
   * @param { Formatter } formatter
   * @param { { [key: string]: string } } fileURLs object with file locations, objects properties must match file name
   */
  constructor(formatter, fileURLs) {
    this.formatter = formatter

    this.fileURLs = fileURLs

    if (!Object.keys(this.fileURLs).length)
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
      .keys(this.fileURLs)
      .map(name =>
        fetch(this.fileURLs[name])
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
        firedTriggersReturn = this.formatter.fire('default', file, fieldIndex++)
      else
        firedTriggersReturn = this.formatter.fire(matchedFlag, file)

      firedTriggersReturns.push(firedTriggersReturn)
    }

    return firedTriggersReturns
  }
}