
export enum DynamicTypes {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
  external = 'external',
  prefab = 'prefab',
}


export interface IFileRendererOptions {
  readonly warn?: boolean
}

export interface IDynamicElement {
  readonly elementCopy: HTMLElement;
  readonly DOMElement: HTMLElement;
  readonly value: string;
  readonly type: DynamicTypes;
}

export interface IBranch {
  [BRANCH_NAME: string]: string | IBranch[] | undefined,
  children?: IBranch[],
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
