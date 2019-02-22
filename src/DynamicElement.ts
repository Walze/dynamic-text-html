import { DynamicTypes } from "./types";
import { mapEnum } from "./barrel";

export class DynamicElement {
  public static htmlAttrs = `${DynamicTypes.field} ${DynamicTypes.lines} ${DynamicTypes.loop}`
  public static types = mapEnum(DynamicTypes)

  public readonly value: string
  public _dynamicFields: HTMLElement[] | undefined
  public htmlDyEl: boolean

  public get dynamicFields() {
    if (!this._dynamicFields)
      this._dynamicFields = Array.from(this.element.querySelectorAll('[type]'))

    return this._dynamicFields
  }

  public constructor(
    public element: HTMLElement,
    public readonly type: DynamicTypes = DynamicTypes.text,
    fileName?: string | undefined,
    public cloned: boolean = false,
  ) {
    this.htmlDyEl = DynamicElement.htmlAttrs.includes(type)
    this.value = fileName || element.getAttribute(type) as string
    this._dynamicFields = undefined
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

    return new DynamicElement(clone, this.type, this.value, true)
  }

  public update(dyEl: DynamicElement) {
    this.element.replaceWith(dyEl.element)
    this.element = dyEl.element
  }

}
