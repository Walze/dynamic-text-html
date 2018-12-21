
export enum DynamicTypes {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
  external = 'external',
  prefab = 'prefab',
}

export interface IDynamicElement {
  readonly elementCopy: Element;
  readonly DOMElement: Element;
  readonly value: string;
  readonly type: DynamicTypes;
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
  nameWExt: string,
  data: string
  rendered?: boolean,
}

export interface IMakeElementOptions {
  id?: string,
  classNames?: string[],
  attributes?: Array<{ attribute: string; value: string }>
}
