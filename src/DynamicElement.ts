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

  public _dynamicFields: HTMLElement[] | undefined
  public types: IType[]
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
    this.types = DynamicElement.types.map((name) => {
      const value = element.getAttribute(name) || _fileName
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

  public update(dyEl: DynamicElement, warn = false) {
    if (warn) {
      const bodyHas = document.body.contains(this.element)

      if (!bodyHas)
        console.warn(`Replaced non existant element`, this, dyEl)
    }

    this.element.replaceWith(dyEl.element)
    this.element = dyEl.element
  }

}
