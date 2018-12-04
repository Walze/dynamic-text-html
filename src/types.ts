
export enum Attribute {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
}

export type IAttributes = {
  [key in Attribute]: IAttributeElement[]
}

export interface IAttributeElement {
  el: Element;
  value: string;
  name: Attribute;
}

export interface IFileObject {
  [key: string]: string
}

export interface IFileRendererOptions {
  ext?: string,
}

export interface IFileType { name: string, data: string }
