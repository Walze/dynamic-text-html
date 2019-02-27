import { DynamicTypes } from "./types"
import { mapEnum } from "./helpers"

export interface IType {
  htmlRender: boolean,
  name: DynamicTypes,
  value: string,
}

export class DynamicElement {
  public static htmlAttrs = `${DynamicTypes.field} ${DynamicTypes.lines} ${DynamicTypes.loop}`
  public static types = mapEnum(DynamicTypes)

  public static typesSelector = DynamicElement.types
    .map((_) => `[${_}]`)
    .join(',')

  public static mapChildren(arr: DynamicElement[], prev: DynamicElement[] = []) {
    const arr2 = prev

    arr.map((d) => {
      if (d.children.length < 1)
        return

      d.children.map((c) => arr2.push(c))
      DynamicElement.mapChildren(d.children, arr2)
    })



    return arr2
  }

  public static getDyElements(ref: HTMLElement): DynamicElement[] {
    const els = Array
      .from(ref.children)
      .filter((el) => el.matches(DynamicElement.typesSelector)) as HTMLElement[]

    if (els.length < 1) return []

    const dyels = els.map((el) => new DynamicElement(el))

    return dyels
  }


  public _dynamicFields: HTMLElement[] | undefined
  public types: IType[]
  public children: DynamicElement[]

  public get dynamicFields() {
    if (!this._dynamicFields)
      this._dynamicFields = Array.from(this.element.querySelectorAll('[type]'))

    return this._dynamicFields
  }

  public constructor(
    public element: HTMLElement,
    private _fileName?: string | undefined,
    public cloned: boolean = false,
  ) {
    this.types = this._getTypes()
    this.children = this._getChildren()
  }

  private _getChildren() {
    return DynamicElement.getDyElements(this.element)
  }

  private _getTypes() {
    return DynamicElement.types.map((name) => {
      const value = this.element.getAttribute(name) || this._fileName
      if (!value) return

      return {
        name,
        value,
        htmlRender: DynamicElement.htmlAttrs.includes(name),
      }
    })
      .filter((_) => _) as IType[]
  }

  public set outerHTML(string) {
    this.element.outerHTML = string
  }

  public get outerHTML() {
    return this.element.outerHTML
  }

  public set innerHTML(string) {
    this.element.innerHTML = string
  }

  public get innerHTML() {
    return this.element.innerHTML
  }

  public clearInner() {
    this.innerHTML = ''
  }

  public cloneQuery(selector: string, deep = true) {
    const el = this.element.querySelector(selector)
    if (!el) return undefined

    return el.cloneNode(deep)
  }

  public clone(deep = true) {
    const clone = this.element.cloneNode(deep) as HTMLElement

    return new DynamicElement(clone, this._fileName, true)
  }

  public update(dyEl: DynamicElement) {
    this.element.replaceWith(dyEl.element)
    this.element = dyEl.element
  }

}