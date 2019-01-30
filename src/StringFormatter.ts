import marked from 'marked'

import { IMakeElementOptions } from './types'
import { replaceHTMLCodes } from './helpers'

const regexs = {
  lineBreak: /\n{3,}/g,
  comments: /\/\*[.\s\n\r\S]*\*\//g,
  // inlineClass: /(!?)\{([^{}]+)\}(\S+)/g,
  blockClass: /\({\s*\[([^\]]+)\]\s*(?:\[([^\]]+)\])?([^}]*)?}\)/g,
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
      ._syntaxReplacer()
      ._marked()
  }

  // turn into a helper someday?
  private _recursive = (string: string) => {

    const replaceFunc = (replacee: string) => replacee.replace(regexs.blockClass, (...match: string[]) => {
      const classNames = match[1].split(/\s+/)
      const tag = match[2] ? match[2].trim() : match[2]
      let text = match[3] ? match[3].trim() : ''
      const textWCloseTag = `${text}})`
      const isRecursive = regexs.blockClass.test(textWCloseTag)

      if (isRecursive)
        text = replaceFunc(textWCloseTag)

      let newHTMLSF = SF(text)

      if (text) {
        newHTMLSF = newHTMLSF
          .markdown()
          .removePTag()
      }

      const newHTML = newHTMLSF
        .makeElement(tag || 'div', { classNames })
        .outerHTML

      return newHTML
    })


    return replaceFunc(string)
      .replace(/\}\)/g, '')
  }

  private _syntaxReplacer = () => SF(this._recursive(this.string), this)

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
