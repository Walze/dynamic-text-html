
import { FileRenderer } from './ts/FileRenderer'

declare global {

  interface IArrayConstructor {
    // tslint:disable-next-line:no-any
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
    from<T>(arrayLike: ArrayLike<T>): T[];
  }

}

export interface IparcelGlob {
  [key: string]: string | {}
  default: { [key: string]: string }
}

export interface IFileRendererOptions {
  ext?: string,
  flag?: RegExp,
  defaultCssSelector?: string,
  triggers?: ITriggerType
}

export interface IFileType { name: string, data: string }

export type emitDefault = <T>(
  this: FileRenderer,
  file: IFileType,
  fieldIndex: number,
  ...args: T[]) => T | void

export type emitCustom = <T>(
  reference: FileRenderer,
  file: IFileType,
  divs: Element[],
  ...args: T[]) => T | void

export interface ITriggerType {
  [key: string]: emitCustom
  default: emitCustom
}
