import marked from 'marked';
import { isString } from 'util';

/** Helper for getting a StringFormatter instance */
export const SF = (text: string) => new StringFormatter(text)

/**
 * Used to help format strings
 */
export class StringFormatter {

  private readonly _string: string

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

    this._string = text

  }

  /**
   * return instance string
   */
  public string(): string {

    return this._string

  }


  /**
   * Splits on every line break
   */
  public splitOnN = (trim: boolean = false): string[] => {

    const t1 = trim ? this._string.trim() : this._string

    return t1
      .split('\n')
      .filter((t) => t.match(/[^\s]/))

  }

  public everyNthLineBreak = (everyN: number = 0, filterEmpty = true): string[] => {

    const regex = /\r\n|\r|\n/ug

    const lines = this._string
      .trim()
      .split(regex)
      .map((txt) => txt.trim())


    if (everyN <= 0)
      return filterEmpty ? lines.filter((txt) => txt) : lines


    const groups: string[] = []

    /** Blocks consecutive breaks */
    let blocked = false

    let groupsIndex = 0
    let breakCounter = 0

    lines.map((line) => {

      let goToNextGroup = false
      const isEmpty = line === ''

      if (!groups[groupsIndex])
        groups[groupsIndex] = ''

      if (isEmpty) breakCounter++
      else breakCounter = 0

      // if breakcounter matches param
      goToNextGroup = breakCounter === everyN && everyN !== 0

      groups[groupsIndex] += `${line}\r\n`

      if (!goToNextGroup)
        blocked = false

      if (goToNextGroup && !blocked) {

        groupsIndex++
        blocked = true

      }

    })

    return groups

  }


  /**
   *  removes ./
   */
  public removeDotSlash(): StringFormatter {

    return SF(
      this._string.replace(/^\.\//g, ''),
    )

  }

  /**
   * Removes <p></p>
   */
  public removePTag(): StringFormatter {

    return SF(
      this._string
        .replace(/<p>/gu, '')
        .replace(/<\/p>/gu, ''),
    )

  }


  public removeComments(): StringFormatter {

    return SF(
      this._string.replace(/\{\{[^{}]*\}\}/gu, ''),
    )

  }


  public markdown(): StringFormatter {

    return SF(
      marked(
        SF(this._string)
          ._markClasses()
          ._markBlockClasses()
          .string(),
      ),
    )

  }


  private _inlineClassReplacer = (...match: string[]) => {

    const { 3: text } = match

    const classes = match[2] ? match[2].split(/,\s?/) : undefined
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
    if (!regex.test(this._string)) return this

    const newString = this._string
      .replace(regex, this._inlineClassReplacer.bind(this))

    return SF(newString)

  }

  private _blockClassReplacer(match: string) {
    const text = this._string;
    const replace = match;
    const classes = match
      .replace('{[', '')
      .replace(']}', '')
      .split(' ');

    const startI = text.indexOf(replace);
    const endI = text.indexOf('\n\r', startI);

    const start = text.substring(0, startI);
    const end = text.substring(endI, text.length);

    const innerText = text
      .substring(startI, endI)
      .replace(replace, '')
      .trim();

    const newHTML = SF(innerText)
      .markdown()
      .makeElement('div', classes);

    const newText = start + newHTML + end;

    return newText
  }

  private _markBlockClasses(): StringFormatter {

    const regex = /\{\[(.+)\]\}/ug
    const matches = this._string.match(regex)
    if (!matches) return this

    const replaced = matches.map(this._blockClassReplacer)

    return SF(replaced[replaced.length - 1])
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

    return `<${tag} ${idString}${classesString}>${this._string}</${tag}>`

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
