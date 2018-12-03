
export enum ElAttrType {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
}

export interface IElAttr {
  el: Element;
  name: string;
  type: ElAttrType;
}

export interface IFileObject {
  [key: string]: string
}

export interface IFileRendererOptions {
  ext?: string,
}

export interface IFileType { name: string, data: string }
