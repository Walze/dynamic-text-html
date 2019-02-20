
export enum DynamicTypes {
  field = 'field',
  lines = 'lines',
  loop = 'loop',
  external = 'external',
}


export interface IFileRendererOptions {
  readonly warn?: boolean
}

export interface IDynamicElement {
  readonly elementCopy: HTMLElement;
  readonly DOMElement: HTMLElement;
  readonly value: string;
  readonly type: DynamicTypes;
  inlineText?: string;
}

export interface IBranch {
  [BRANCH_NAME: string]: string | IBranch[] | undefined,
  children?: IBranch[],
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
