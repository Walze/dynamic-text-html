
export interface IElAttr {
  name: string;
  el: Element;
}

export interface IFileObject {
  [key: string]: string
}

export interface IFileRendererOptions {
  ext?: string,
}

export interface IFileType { name: string, data: string }
