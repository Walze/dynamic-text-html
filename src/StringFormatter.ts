import marked from 'marked'

import { IDynamicElement, IMakeElementOptions } from './types'
import { globalMatch } from './helpers'


const externalSelector = 'external'

const regexs = {
  external: /\[\[(.+)?\](.+)?\]/g,
  comments: /\/\*[.\s\n\r\S]*\*\//g,
  inlineClass: /(!?)\{([^{}]+)\}(\S+)/g,
  blockClass: /(!?)\{\[([^\]]+)\]([^\}]*)\}/g,
}


/** Helper for getting a StringFormatter instance */
export const SF = (text: string) => new StringFormatter(text)

/**
 * Used to help format strings
 */
export class StringFormatter {

  private readonly _string: string

  public constructor(text: string) {

    if (typeof text !== 'string') {
      throw new Error(`constructor expected string, given ${text}`)
    }

    this._string = text

  }

  public removeComments() {
    const newString = this.string.replace(regexs.comments, '\n')

    return SF(newString)
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

    const lineBreaker = (line: string) => {

      let goToNextGroup = false
      const isEmpty = line === ''

      if (!groups[groupsIndex])
        groups[groupsIndex] = ''

      if (isEmpty)
        breakCounter++
      else
        breakCounter = 0

      // if breakcounter matches param
      goToNextGroup = breakCounter === everyN && everyN !== 0
      groups[groupsIndex] += `${line}\r\n`

      if (!goToNextGroup)
        blocked = false

      if (goToNextGroup && !blocked) {
        groupsIndex++
        blocked = true
      }

    }

    lines.map(lineBreaker)

    return groups
  }


  public replaceExternal(elAttr: IDynamicElement): StringFormatter {
    const newText = this._string
      .replace(regexs.external, this._externalReplacer(elAttr.element))
      .replace(/>\s+</gu, "><")

    return SF(newText)
  }

  /**
   *  Function generator that replaces the [[external]] tag
   */
  private _externalReplacer = (el: Element) =>
    (...args: string[]) => {
      const [, external, file] = args

      if (file)
        return SF('')
          .makeElement('div', {
            attributes: [{
              attribute: 'field',
              value: file.trim(),
            }],
          })
          .outerHTML

      const div = el.querySelector(`[${externalSelector} = ${external}]`) as Element
      if (!div) {
        console.warn(`External element '[${externalSelector} = ${external}]' not found`)

        return ''
      }

      const newText = div.outerHTML.trim()

      return newText
    }


  /**
   *  removes ./
   */
  public removeDotSlash(): StringFormatter {

    return SF(
      this._string.replace(/^\.\//gu, ''),
    )

  }

  /**
   * Removes <p></p>
   */
  public removePTag(): StringFormatter {

    return SF(
      this._string.replace(/<\/?p>/gu, ''),
    )

  }


  public markdown(): StringFormatter {
    const string = this._string.trim()

    if (!string || string !== string) return SF('')

    const markedClasses = SF(this._string)
      ._markClasses()
      ._markBlockClasses()
      .string

    return SF(marked(markedClasses))

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
    if (!regex.test(this._string)) return this

    const newString = this._string
      .replace(regex, this._inlineClassReplacer.bind(this))

    return SF(newString)

  }

  private _blockClassReplacer = () => {
    let previousText = this._string

    const replaceFunction = (match: RegExpExecArray) => {

      const replace = match[0]
      const removeP = !!match[1]
      const classNames = match[2].split(/\s+/)
      const { 0: tag } = match[3].split(/\s+/)

      const startI = previousText.indexOf(replace)
      if (startI === -1) {
        return previousText
      }

      let endI = previousText.indexOf('\n\r', startI)
      if (endI === -1) endI = previousText.length

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
    const matches = globalMatch(regex, this._string)
    if (!matches) return this

    const replaced = matches.map(this._blockClassReplacer()) as string[]

    return SF(replaced[replaced.length - 1])
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

    element.innerHTML = this._string

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
