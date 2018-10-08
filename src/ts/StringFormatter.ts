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
      console.error('Given ', text)
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
   * Splits on every line break
   */
  public splitOnN = (text: string, trim: boolean = false) => {

    const t1 = trim ? text.trim() : text

    return t1
      .split('\n')
      .filter((t) => t.match(/[^\s]/))

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


  /**
   * Makes an in-line element
   *
   * @param tag tag name
   * @param classArray array of css classes
   * @param id element id
   */
  public makeElement(
    tag: string,
    classArray?: string[],
    id?: string | undefined,
  ) {

    const classes = classArray ? classArray.join(' ') : undefined
    const classesString = classes ? `class="${classes}"` : ''

    const idString = id ? `id="${id}" ` : ''

    return `<${tag} ${idString}${classesString}>${this._STRING}</${tag}>`

  }


  /**
   * Makes an in-line element
   *
   * @param tag tag name
   * @param classArray array of css classes
   * @param id element id
   */
  public makeInlineMarkedElement(
    tag: string,
    classArray?: string[],
    id?: string | undefined,
  ) {
    return this
      .markdown()
      .removePTag()
      .makeElement(tag, classArray, id)
  }


  /**
   * Makes an in-line string
   */
  public makeInlineMarkedText() {
    return this
      .markdown()
      .removePTag()
      .string()
  }


  /**
   *  Maps array then joins it
   *
   * @param array initial array
   * @param callback map callback
   * @param returnInstance return instance of this?
   * @param join join string
   */
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
