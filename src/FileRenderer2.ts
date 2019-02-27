import { globalMatch, makeFile } from './helpers'
import { SF, getMarkedLines } from './StringFormatter'
import {
  DynamicTypes,
  IFile,
  IFileRendererOptions,
} from './types'
import { DynamicElement, IType } from './DynamicElement'


export const selectors = {
  externalRGX: /\[([^\[\]]+?)?\[(.+?)?\]([^\[\]]+?)?\]/gm,
  model: '.model',
  model_line: '.model-line', // deprecated
  line: /\[line-?(-)?(\d*)\]/g,
}

// tslint:disable-next-line:max-classes-per-file
export class FileRenderer2 {

  public dyElements: DynamicElement[]
  // private _lastFile: IFile | undefined

  public constructor(
    public files: IFile[],
    public ext: string = 'md',
    public selectorReference = document.body,
    public options: IFileRendererOptions = {},
  ) {
    this.files = this.files.map((file) => {
      file.data = SF(file.data)
        .removeComments()
        .string

      file.rendered = false
      this._checkValidFile(file)

      return file
    })

    this.dyElements = DynamicElement.getDyElements(selectorReference)

    console.log(
      DynamicElement.mapChildren(this.dyElements)
    )
  }

  private _findDyElType(type: DynamicTypes, value: string) {
    let foundDyel: DynamicElement | undefined
    let foundType: IType | undefined

    this.dyElements.map((dyel) => dyel.types.some((_type) => {
      if (_type.name === type && _type.value === value) {
        foundDyel = dyel
        foundType = _type

        return true
      } else return false
    }))

    if (!foundType) return

    return {
      dyel: foundDyel as DynamicElement,
      type: foundType as IType,
    }
  }

  public render() {
    this.dyElements.map((dyel) => {
      this._matchFileAndRender(dyel)
    })
  }


  private _matchFileAndRender(dyel: DynamicElement) {
    dyel.types.map((type) => {
      if (!type.htmlRender) return

      const file = this.files.find((_file) => type.value === _file.name)
      if (!file) return

      this._renderDyEl(file.data)(dyel)
    })
  }


  private _renderDyEl(text: string) {
    return (dyel: DynamicElement) => {
      const newDyEl = new DynamicElement(dyel.element.cloneNode() as HTMLElement)
      newDyEl.innerHTML = text

      this._handleExternals(newDyEl)
      this._render(dyel, newDyEl)

      dyel.update(newDyEl)
    }
  }

  /**
   * Renders new Dynamic elements
   */
  private _handleExternals(textDyel: DynamicElement) {
    const externalMatches = globalMatch(selectors.externalRGX, textDyel.innerHTML)

    if (externalMatches) {
      externalMatches.map((matchRGX) => {
        const prefab = !!matchRGX[3]

        if (prefab)
          this._renderPrefab(matchRGX, textDyel)
        else
          this._renderExternal(matchRGX, textDyel)
      })
    }

  }

  private _renderExternal(matchRGX: RegExpMatchArray, dyel: DynamicElement) {
    const { element } = dyel
    const { 0: match, 2: external } = matchRGX

    const found = this._findDyElType(DynamicTypes.external, external)

    if (found) {
      const foundExternal = found.dyel.clone()

      // update new generated dyels
      foundExternal.children.map((_dyel) => {
        this._matchFileAndRender(_dyel)
      })
      this._matchFileAndRender(foundExternal)

      element.innerHTML = element.innerHTML
        .replace(match, foundExternal.element.outerHTML.trim())
        .replace(/>\s+</gu, ">\n<")


    } else {
      console.warn(`External element '[external = ${external}]' not found on file`, dyel)

      element.innerHTML = element.innerHTML
        .replace(match, `[EXTERNAL NOT FOUND = ${external}]`)
    }
  }


  private _renderPrefab(matchRGX: RegExpMatchArray, dyel: DynamicElement) {
    const { element } = dyel

    const { 0: match, 2: prefabName } = matchRGX
    let { 1: fileName, 3: fileOrText } = matchRGX
    if (!fileOrText) return false
    fileOrText = fileOrText.trim()

    const foundFile = this.files.find((f) => f.name === fileOrText)
    const file: IFile = foundFile
      ? foundFile
      : makeFile('INLINE_TEXT', fileOrText, this.ext)


    const found = this._findDyElType(DynamicTypes.external, prefabName)

    if (!found) {
      debugger
      console.warn(`Prefab element '[external = ${prefabName}]' not found`, dyel)

      return false
    }

    const prefabFound = found.dyel

    // copies prefab to manage attributes
    const prefab = prefabFound.clone()
    prefab.element.removeAttribute('external')

    // inline type
    const type = prefab.element.getAttribute('type') as DynamicTypes | undefined
    if (type) prefab.element.setAttribute(type, file.name)

    const types = prefab.dynamicFields.map((el) => {
      const childType = el.getAttribute('type') as string

      el.setAttribute(childType, file.name)
    })

    if (this.options.warn && types.length < 1)
      console.warn(`Prefab ${prefab} needs at least 1 type`)

    // update new generated dyels
    DynamicElement
      .getDyElements(prefab.element)
      .map((_dyel) => {

        const inline = _dyel.element.hasAttribute('inline')

        if (inline && !fileName)
          console.error('Inline text dynamic element but no file name', [prefab, _dyel])

        const render = inline
          ? this._renderDyEl(file.data)
          : this._renderDyEl(file.data)

        render(_dyel)
      })

    // sets prefab html into dynamic elements html
    element.innerHTML = element.innerHTML
      .replace(match, prefab.element.outerHTML.trim())


    return true
  }


  /**
   * Renders element by given type
   */
  private _render(dyel: DynamicElement, textDyEl: DynamicElement) {
    dyel.types.map((type) => {
      if (!type.htmlRender) return

      switch (type.name) {
        case DynamicTypes.field:
          this._renderField(textDyEl)
          break
        case DynamicTypes.lines:
          this._renderLines(dyel, textDyEl)
          break
        case DynamicTypes.loop:
          this._renderLoop(dyel, textDyEl)
          break
        default:
          throw new Error(`Tried rendering invalid dynamic element type ${type}`)
      }
    })
  }


  /**
   *  Renders field attribute
   */
  private readonly _renderField = ({ element }: DynamicElement) => {
    element.innerHTML = SF(element.innerHTML)
      .markdown()
      .string
  }


  /**
   *  Renders lines attribute
   * @param dyEl where divs and structure come from
   * @param textDyEl where text comes from and goes to
   */
  private readonly _renderLines = (dyEl: DynamicElement, textDyEl: DynamicElement, lines?: string[]) => {
    const linesArray = lines || getMarkedLines(textDyEl.innerHTML.trim())
    let index = 0

    textDyEl.innerHTML = dyEl.innerHTML
      .replace(selectors.line, (...args: string[]) => {

        const skip = !!args[1]
        const line = parseInt(args[2], 10)
        const text = linesArray[index]

        if (skip) {
          index += 1

          return ''
        }

        if (!isNaN(line)) {
          return linesArray[line]
        }

        index += 1

        return text
      })

  }


  /**
   *  Renders the loop attribute
   */
  private readonly _renderLoop = (dyEl: DynamicElement, textDyEl: DynamicElement) => {
    const loopDyel = dyEl.clone()
    const loop = loopDyel.element

    const model = dyEl.cloneQuery(selectors.model)
    loopDyel.clearInner()

    if (!model) throw new Error('model not found')

    const breaks = Number(loop.getAttribute('breaks')) || 1
    const liness = SF(textDyEl.innerHTML)
      .splitEveryNthLineBreak(breaks)

    const modelDyel = new DynamicElement(model.cloneNode(true) as HTMLElement)

    liness.map((lines) => {
      const textCopy = modelDyel.clone()

      this._renderLines(modelDyel, textCopy, lines)

      loop.append(textCopy.element)
    })


    textDyEl.innerHTML = loop.innerHTML
  }


  /**
   *  Checks is the file is valid
   */
  private readonly _checkValidFile = (file: IFile) => {

    // tslint:disable-next-line: strict-type-predicates
    if (typeof file.name !== 'string')
      throw new Error('file name is not string')

    // tslint:disable-next-line: strict-type-predicates
    if (typeof file.data !== 'string')
      throw new Error('file data is not string')

    if (file.name === '')
      throw new Error('file name is empty')

    if (file.data === '')
      console.warn('file data is empty')

  }
}
