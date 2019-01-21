import marked from 'marked'

import { IMakeElementOptions } from './types'
import { globalMatch, replaceHTMLCodes, replaceBetween, closestN } from './helpers'


const regexs = {
  lineBreak: /\n{3,}/g,
  comments: /\/\*[.\s\n\r\S]*\*\//g,
  inlineClass: /(!?)\{([^{}]+)\}(\S+)/g,
  blockClass: /(!?){\[([^\]]+)\]([^}]*)}/g,
  blockClassEnd: /{\[\]}/g,
}


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

  private _blockClassReplacer = () => {
    const starts = globalMatch(regexs.blockClass, this.string)
    const ends = globalMatch(regexs.blockClassEnd, this.string)

    let newString: string = this.string

    if (starts && ends) {
      const SIs = starts.map((a) => a.index)
      const taken: number[] = []

      ends.map((endMatch) => {
        const startIndexes = SIs.filter((a) => a < endMatch.index && !taken.includes(a))
        const start = starts.find((a) =>
          a.index === closestN(startIndexes, endMatch.index),
        ) as RegExpExecArray
        taken.push(start.index)

        const text = this.string.substring(start.index + start[0].length, endMatch.index)
        const removeP = !!start[1]
        const classNames = start[2].split(/\s+/)
        const { 0: tag } = start[3]
          .trim()
          .split(/\s+/)

        let newHTMLSF = SF(text)

        if (text && text !== '') {
          // newHTMLSF = newHTMLSF.markdown()

          if (removeP)
            newHTMLSF = newHTMLSF.removePTag()
        }

        const newHTML = newHTMLSF
          .makeElement(tag || 'div', { classNames })
          .outerHTML

        newString = replaceBetween(
          newString,
          start.index,
          endMatch.index + endMatch[0].length,
          newHTML,
        )

        debugger
        console.log(newString)
      })
    }

    return () => newString
  }

  public _blockClassReplacer2 = () => {
    let previousText = this.string

    const replaceFunction = (match: RegExpExecArray) => {

      const replace = match[0]
      const removeP = !!match[1]
      const classNames = match[2].split(/\s+/)
      const { 0: tag } = match[3]
        .trim()
        .split(/\s+/)

      const startI = previousText.indexOf(replace)
      if (startI === -1) {
        return previousText
      }

      let endI = previousText.indexOf('{[]}')
      if (endI === -1) endI = previousText.length
      // endI -= 4

      const start = previousText.substring(0, startI)
      const end = previousText.substring(endI, previousText.length)

      const innerText = previousText
        .substring(startI, endI)
        .replace(replace, '')
        .trim()


      let newHTMLSF = SF(innerText)

      if (innerText && innerText !== '') {
        newHTMLSF = newHTMLSF.markdown()

        if (removeP)
          newHTMLSF = newHTMLSF.removePTag()
      }

      const newHTML = newHTMLSF
        .makeElement(tag || 'div', { classNames })
        .outerHTML

      const newText = start + newHTML + end

      previousText = newText

      return previousText
    }

    return replaceFunction
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
