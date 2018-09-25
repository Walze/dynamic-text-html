import marked from 'marked';
import { isString } from 'util';

/** Helper for using StringFormatter */
export const SF = (text: string) => new StringFormatter(text)

export class StringFormatter {

  private _STRING: string

  public constructor(text: string) {

    if (!isString(text)) {
      console.error('String: ', text)
      throw new Error(`constructor expected string`)
    }

    this._STRING = text

  }

  private _newThis = (text: string) => new StringFormatter(text)

  public string(): string {

    return this._STRING

  }

  public removeDotSlash(): StringFormatter {

    return this._newThis(
      this._STRING.replace(/^\.\//g, ''),
    )

  }

  public removePTag(): StringFormatter {

    return this._newThis(
      this._STRING
        .replace(/<p>/gu, '')
        .replace(/<\/p>/gu, ''),
    )

  }


  public removeComments(): StringFormatter {

    return this._newThis(
      this._STRING.replace(/\{\{[^]*\}\}/gu, ''),
    )

  }


  /**
   * adds marked.js to string
   */
  public markdown(): StringFormatter {

    return this._newThis(marked(this._STRING))

  }

  private _replaceMarkClasses(...match: string[]): string {

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
  public markClasses(): StringFormatter {

    const regex = /(!?)\{([^{}]+)*\}(\S+)/ug

    const newString = this._STRING
      .replace(regex, this._replaceMarkClasses.bind(this))

    return this._newThis(newString)

  }


  public makeElement(
    el: string,
    classArray?: string[],
    id?: string | undefined,
  ): string {

    const classes = classArray ? classArray.join(' ') : undefined
    const classesString = classes ? `class="${classes}"` : ''

    const idString = id ? `id="${id}"` : ''

    return `<${el} ${idString} ${classesString}>${this._STRING}</${el}>`

  }


}
