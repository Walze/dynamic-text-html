

export default class DynamicText {

  /**
   * @param { Formatter } formatter
   * @param { { [key: string]: string } } fileURLs object with file locations, objects properties must match file name
   */
  constructor(formatter, fileURLs) {
    this.formatter = formatter

    this.fileURLs = fileURLs

    if (!Object.keys(this.fileURLs).length)
      throw new Error('Nenhum arquivo de text foi encontrado na pasta')

    /**
     * @type { fileType[] }
     */
    this.files = []

    this.triggersReturns = this
      ._loadFiles()
      .then(files => this.fireFiles(files))
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
          .catch(err => {
            console.error(err)
            throw new Error('Could not fetch text files')
          })
      )

    return this.files = await Promise.all(promises)
  }

  /**
   * @param { fileType[] } files
   */
  fireFiles(files) {

    let defaultFileIndex = 0
    const firedTriggersReturns = []

    for (const file of files) {

      let firedTriggersReturn

      // if didn't match, it's a default
      const customTrigger = this.formatter.matchFlag(file.data)

      if (customTrigger)
        firedTriggersReturn = this.formatter.pullTrigger(customTrigger, file)
      else
        firedTriggersReturn = this.formatter.pullTrigger('default', file, defaultFileIndex++)

      firedTriggersReturns.push(firedTriggersReturn)
    }

    return firedTriggersReturns
  }
}