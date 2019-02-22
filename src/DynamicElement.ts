import { DynamicTypes } from "./types";
import { mapEnum } from "./barrel";

export class DynamicElement {
  public static htmlRenderable = `${DynamicTypes.field} ${DynamicTypes.lines} ${DynamicTypes.loop}`
  public static types = mapEnum(DynamicTypes)

  public readonly value: string
  public readonly dynamicFields: HTMLElement[]

  public constructor(
    public readonly type: DynamicTypes,
    public element: HTMLElement,
    fileName?: string | undefined,
    public cloned: boolean = false,
    public inlineText?: string,
  ) {
    this.value = fileName || element.getAttribute(type) as string
    this.dynamicFields = Array.from(element.querySelectorAll('[type]'))
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

    return new DynamicElement(this.type, clone, this.value, true)
  }

  public update(dyEl: DynamicElement) {
    this.element.replaceWith(dyEl.element)
    this.element = dyEl.element
  }

}
