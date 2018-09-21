import marked from 'marked'

export class StringFormatter {

  private _STRING: string

  public constructor(text: string) {

    if (typeof text !== 'string')
      throw new Error(`constructor got ${typeof text} instead of string`)

    this._STRING = text

  }

  public string() {

    return this._STRING

  }

  public removePTag() {

    return new StringFormatter(
      this._STRING
        .replace(/<p>/gu, '')
        .replace(/<\/p>/gu, ''),
    )

  }


  public removeComments() {

    return new StringFormatter(
      this._STRING.replace(/\{\{[^]*\}\}/gu, ''),
    )

  }


  /**
   * adds marked.js to string
   */
  public markdown() {

    return new StringFormatter(marked(this._STRING))

  }

  private _replaceMarkClasses(...match: string[]) {

    const { 3: text } = match
    this._STRING = text

    const classes = match[2] ? match[2].split(' ') : undefined
    const breakLine = Boolean(match[1])

    const el = breakLine ? 'div' : 'span'

    const newWord = this.makeElement(el, classes)

    return newWord

  }

  /**
   * marks custom classes
   */
  public markClasses() {

    const regex = /(!?)\{([^{}]+)*\}(\S+)/ug

    const newString = this._STRING
      .replace(regex, this._replaceMarkClasses.bind(this))

    return new StringFormatter(newString)

  }


  public makeElement(el: string, classArray?: string[], id?: string | undefined) {

    const classes = classArray ? classArray.join(' ') : undefined
    const classesString = classes ? `class="${classes}"` : ''

    const idString = id ? `id="${id}"` : ''

    return `<${el} ${idString} ${classesString}>${this._STRING}</${el}>`

  }


}
