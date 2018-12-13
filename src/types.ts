
export enum DynamicTypes {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
}

export interface IDynamicElement {
  element: Element;
  file: string;
  type: DynamicTypes;
}

export type IDynamicElementsObject = {
  [key in DynamicTypes]: IDynamicElement[]
}

export interface IFileObject {
  [fileName: string]: string
}

export interface IFileRendererOptions {
  ext?: string,
}

export interface IFile {
  name: string,
  data: string
  rendered?: boolean,
}
