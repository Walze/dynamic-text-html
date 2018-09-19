import marked from 'marked'

export default class StringFormatter {

  /**
   * @param { string } string
   */
  constructor(string) {

    if (typeof string !== 'string')
      throw new Error(`constructor got ${typeof string} instead of string`)

    /** @type { string } */
    this._string = string

  }

  /**
   * @returns {string}
   */
  string() {

    return this._string

  }

  removePTag() {

    return new StringFormatter(
      this._string
        .replace(/<p>/gu, '')
        .replace(/<\/p>/gu, '')
    )

  }


  removeComments() {

    return new StringFormatter(
      this._string.replace(/\{\{[^]*\}\}/gu, '')
    )

  }


  mark() {

    return new StringFormatter(
      marked(this._string)
    )

  }

  _replaceCustomMark(...match) {

    const { 3: text } = match
    this._string = text

    const classes = match[2] ? match[2].split(' ') : null
    const breakLine = Boolean(match[1])

    const el = breakLine ? 'div' : 'span'

    const newWord = this.makeElement(el, classes)

    return newWord

  }

  customMarks() {

    const regex = /(!?)\{([^{}]+)*\}(\S+)/ug

    const newString = this._string
      .replace(regex, this._replaceCustomMark.bind(this))

    return new StringFormatter(newString)

  }


  makeElement(el, classArray, id = null) {

    const classes = classArray ? classArray.join(' ') : null
    const classesString = classes ? `class="${classes}"` : ''

    const idString = id ? `id="${id}"` : ''

    return `<${el} ${idString} ${classesString}>${this._string}</${el}>`

  }


}
