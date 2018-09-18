import marked from 'marked'

export default class StringFormatter {

  constructor(string) {

    if (typeof string !== 'string')
      throw new Error(`constructor got ${typeof string} instead of string`)

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


  customMarks() {

    const split = this._string.split(' ')

    const reduce = split.map(word => {

      if (!word) return word

      const match = word.match(/(!?)\[(\S*)\](\S+)/u)

      if (!match) return word


      const { 3: text } = match
      this._string = text

      const classes = match[2].split(' ')
      const breakLine = Boolean(match[1])

      const el = breakLine ? 'div' : 'span'

      const newWord = this.makeElement(el, classes)

      return newWord

    })

    return new StringFormatter(
      reduce.join(' ')
    )

  }


  makeElement(el, classArray, id = '') {

    return `<${el} id="${id}" class="${classArray.join(' ')}">${this._string}</${el}>`

  }


}
