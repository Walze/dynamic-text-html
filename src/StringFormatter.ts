import marked from 'marked'

import { IMakeElementOptions } from './types'
import { globalMatch, replaceHTMLCodes } from './helpers'
import XRegExp from 'xregexp'

const regexs = {
  lineBreak: /\n{3,}/g,
  comments: /\/\*[.\s\n\r\S]*\*\//g,
  inlineClass: /(!?)\{([^{}]+)\}(\S+)/g,
  blockClass: /(!?){\[([^\]]+)\]\s*(?:\[([^\]]+)\])?([^}]*)?}/g,
  block: {
    start: /(!?){\[([^\]]+)\]\s*(?:\[([^\]]+)\])?/g,
    r: /([^}]*)?/g,
    end: /}/g,
  },
}

console.log(regexs)

/** Helper for getting a StringFormatter instance */
export const SF = (text: string, previous?: StringFormatter) => new StringFormatter(text, previous)

export const markdownLine = (lineTxt: string) =>
  SF(lineTxt.trim())
    .markdown()
    .removePTag()
    .string

export const getLines = (data: string) => SF(data)
  .splitConsecutiveLineBreaks(1)

export const getMarkedLines = (data: string) => getLines(data)
  .map(markdownLine)

/**
 * Used to help format strings
 */
export class StringFormatter {

  private readonly _string: string

  public constructor(
    text: string,
    public previous?: StringFormatter,
  ) {
    if (typeof text !== 'string') {
      throw new Error(`constructor expected string, given ${text}`)
    }

    this._string = replaceHTMLCodes(text)
      .replace(/\n\r/, '\n')

  }

  public removeComments() {
    const newString = this.string.replace(regexs.comments, '\n')

    return SF(newString, this)
  }

  /**
   * return instance string
   */
  public get string(): string {

    return this._string

  }

  /**
   * Splits on every line break
   */
  public splitOnN = (trim: boolean = false): string[] => {

    const t1 = trim ? this.string.trim() : this.string

    return t1
      .split('\n')
      .filter((t) => t.match(/[^\s]/))

  }


  public splitEveryNthLineBreak = (nth: number, filter = true, markdown = true) => {
    console.warn('fix')
    const regex = regexs.lineBreak
    const lines = this.string
      .split(regex)
      .map((txt) =>
        markdown ?
          markdownLine(txt)
          : txt,
      )

    const arr: string[][] = []
    let index = 0

    const split = (line: string, __: number) => {

      if (filter && line === '')
        return

      if (!Array.isArray(arr[index]))
        arr[index] = []

      if (arr[index].length === nth) {
        arr[index += 1] = []
      }

      arr[index].push(line)
    }

    lines.map(split)

    return arr
  }

  public splitConsecutiveLineBreaks = (x: number) => {
    const rgx = new RegExp(`\\n{${x + 1}}`)

    return this.string
      .split(rgx)
      .filter((a) => !!a)
  }

  /**
   *  removes ./
   */
  public removeDotSlash(): StringFormatter {

    return SF(
      this.string.replace(/^\.\//gu, ''),
      this,
    )

  }

  /**
   * Removes <p></p>
   */
  public removePTag(): StringFormatter {

    return SF(
      this.string.replace(/<\/?p>/gu, ''),
      this,
    )

  }

  public _marked = () => SF(marked(this.string), this)

  public markdown(): StringFormatter {
    const string = this.string.trim()

    if (!string || string !== string) return SF('')

    return SF(this.string)
      ._markClasses()
      ._markBlockClasses()
      ._marked()
  }

  private _inlineClassReplacer = (...match: string[]) => {

    const { 3: text } = match

    const classNames = match[2] ? match[2].split(/\s/) : undefined
    const breakLine = Boolean(match[1])

    const tag = breakLine ? 'div' : 'span'

    const newWord = SF(text)
      .makeElement(tag, { classNames })
      .outerHTML

    return newWord

  }

  /**
   * marks custom classes
   */
  private _markClasses(): StringFormatter {

    const regex = regexs.inlineClass
    if (!regex.test(this.string)) return this

    const newString = this.string
      .replace(regex, this._inlineClassReplacer.bind(this))

    return SF(newString, this)

  }

  private _recursive = (string: string, start: RegExp, r: RegExp, end: RegExp) => {
    const arr = []
    let i = 0

    console.warn(globalMatch(regexs.blockClass, string))

    string.replace(regexs.blockClass, (...args: string[]) => {
      console.warn(args)



      i += 1

      return 'REGEX_PLACEHOLDER'
    })

    return 1
  }

  private _blockClassReplacer = () => {
    let newString: string = this.string

    this._recursive(
      newString,
      regexs.block.start,
      regexs.block.r,
      regexs.block.end,
    )

    newString = XRegExp.replace(newString, regexs.blockClass, (...match: RegExpMatchArray) => {
      const removeP = !!match[1]
      const classNames = match[2].split(/\s+/)
      const tag = match[3] ? match[3].trim() : match[3]
      const text = match[4] ? match[4].trim() : ''

      let newHTMLSF = SF(text)

      if (text) {
        newHTMLSF = newHTMLSF.markdown()

        if (removeP)
          newHTMLSF = newHTMLSF.removePTag()
      }

      const newHTML = newHTMLSF
        .makeElement(tag || 'div', { classNames })
        .outerHTML

      return newHTML
    })

    return () => newString
  }

  private _markBlockClasses(): StringFormatter {

    const regex = regexs.blockClass
    const matches = globalMatch(regex, this.string)
    if (!matches) return this

    const replaced = matches.map(this._blockClassReplacer()) as string[]

    return SF(replaced[replaced.length - 1], this)
  }

  /**
   * Makes an in-line element
   */
  public makeElement(
    tag: string = 'div',
    options: IMakeElementOptions = {},
  ) {

    const { classNames, id, attributes } = options

    const element = document.createElement(tag)

    if (attributes)
      attributes.map((attr) => element.setAttribute(attr.attribute, attr.value))

    if (classNames)
      classNames.map((name) => element.classList.add(name))

    if (id) element.id = id

    element.innerHTML = this.string

    return element
  }

  /**
   * Makes an in-line element
   */
  public makeInlineMarkedElement(
    tag: string,
    options: IMakeElementOptions,
  ) {
    return this
      .markdown()
      .removePTag()
      .makeElement(tag, options)
  }

  /**
   * Makes an in-line string
   */
  public makeInlineMarkedText() {
    return this
      .markdown()
      .removePTag()
      .string
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
