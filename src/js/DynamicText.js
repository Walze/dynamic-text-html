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
      .then(files => this.formatter.fireFiles(files))
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
          data: await fetch(this.fileURLs[name]).then(response => response.text()),
        }))

      this.files = Promise.all(promises)
      return this.files

    } catch (err) {

      throw new Error(err)

    }

  }

}
