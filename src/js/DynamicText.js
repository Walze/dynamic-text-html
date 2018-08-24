import '../styles/dynamic-files.css'

export default class DynamicText {

  /**
   * @param { Formatter } formatter
   * @param { { [key: string]: string } } fileURLs object with file locations, objects properties must match file name
   */
  constructor(formatter, fileURLs) {

    /** @type { fileType[] } */
    this.files = []
    this.formatter = formatter
    this.fileURLs = fileURLs
    this._loadFiles()
      .then(files => this.fireFiles(files))
      .then(returns => {

        this.triggersReturns = returns
        window.dispatchEvent(new Event('DYNAMIC_LOADED'))

      })

  }

  /**
   * @returns { Promise<fileType[]> }
   */
  _loadFiles() {

    try {

      const promises = Object
        .keys(this.fileURLs)
        .map(async name => ({
          name: `${name}.txt`,
          data: await (await fetch(this.fileURLs[name])).text()
        }))

      this.files = Promise.all(promises)
      return this.files

    } catch (err) {

      throw new Error(err)

    }

  }

  /**
   * @param { fileType[] } files
   */
  fireFiles(files) {

    let defaultFileIndex = 0
    const firedTriggersReturns = []

    for (const file of files) {

      let firedTriggersReturn = null

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
