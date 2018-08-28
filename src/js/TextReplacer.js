import marked from 'marked'

export default class TextReplacer {


  /**
   * @param { string } text
   */
  static removeP(text) {

    return text
      .replace(/<p>/gu, '')
      .replace(/<\/p>/gu, '')

  }


  /**
   * @param { string } text
   */
  static removeComments(text) {

    console.log(text)
    return text.replace(/\{\{[^]*\}\}/gu, '')

  }


  /**
   * @param { string } text
   * @param { boolean } removeP
   */
  static mark(text, removeP = false) {

    const markedText = marked(text)

    if (removeP)
      return this.removeP(markedText)

    return markedText

  }


  /**
   * @param {string} rawText
   */
  static customMarks(rawText) {

    if (!rawText) return rawText

    const split = rawText.split(' ')

    const reduce = split.map(word => {

      if (!word) return word

      const match = word.match(/(!?)\[(\S*)\](\S+)/u)

      if (!match) return word


      const { 3: text } = match
      const classes = match[2].split(' ')
      const breakLine = Boolean(match[1])

      const el = breakLine ? 'div' : 'span'

      const newWord = this.makeElement(el, text, classes)

      return newWord

    })

    return reduce.join(' ')

  }


  static makeElement(el, text, array) {

    return `<${el} class="${array.join(' ')}">${text}</${el}>`

  }


}
