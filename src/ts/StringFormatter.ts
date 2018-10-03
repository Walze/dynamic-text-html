import marked from 'marked';
import { isString } from 'util';

/** Helper for getting a StringFormatter instance */
export const SF = (text: string) => new StringFormatter(text)

/**
 * Used to help format strings
 */
export class StringFormatter {

  private _STRING: string

  public constructor(text: string) {

    if (!isString(text)) {
      console.error('String: ', text)
      throw new Error(`constructor expected string`)
    }

    if (text === '')
      console.info(
        `${this.constructor.name} got empty string in constructor`,
        this.string(),
      )

    this._STRING = text

  }

  /**
   * return instance string
   */
  public string(): string {

    return this._STRING

  }

  /**
   *  removes ./
   */
  public removeDotSlash(): StringFormatter {

    return SF(
      this._STRING.replace(/^\.\//g, ''),
    )

  }

  /**
   * Removes <p></p>
   */
  public removePTag(): StringFormatter {

    return SF(
      this._STRING
        .replace(/<p>/gu, '')
        .replace(/<\/p>/gu, ''),
    )

  }


  public removeComments(): StringFormatter {

    return SF(
      this._STRING.replace(/\{\{[^{}]*\}\}/gu, ''),
    )

  }


  /**
   * adds marked.js to string
   */
  public markdown(): StringFormatter {

    return SF(
      marked(
        SF(this._STRING)
          ._markClasses()
          .string(),
      ),
    )

  }

  private _replaceMarkClasses = (...match: string[]) => {

    const { 3: text } = match

    const classes = match[2] ? match[2].split(' ') : undefined
    const breakLine = Boolean(match[1])

    const el = breakLine ? 'div' : 'span'

    const newWord = SF(text)
      .makeElement(el, classes)

    return newWord

  }

  /**
   * marks custom classes
   */
  private _markClasses(): StringFormatter {

    const regex = /(!?)\{([^{}]+)*\}(\S+)/ug

    const newString = this._STRING
      .replace(regex, this._replaceMarkClasses.bind(this))


    return SF(newString)

  }


  public makeElement(
    el: string,
    classArray?: string[],
    id?: string | undefined,
  ) {

    const classes = classArray ? classArray.join(' ') : undefined
    const classesString = classes ? `class="${classes}"` : ''

    const idString = id ? `id="${id}" ` : ''

    return `<${el} ${idString}${classesString}>${this._STRING}</${el}>`

  }


  public makeInlineMarkedElement(
    el: string,
    classArray?: string[],
    id?: string | undefined,
  ) {
    return this
      .markdown()
      .removePTag()
      .makeElement(el, classArray, id)
  }

  public static mapJoin<A, B>(
    array: A[],
    callback: (value: A, index: number, array: A[]) => B,
    returnInstance = false,
    join = '',
  ) {

    const arr = array
      .map(callback)
      .join(join)

    return returnInstance ? SF(arr) : arr
  }
}
