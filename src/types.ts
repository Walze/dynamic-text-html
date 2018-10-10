

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

export type triggerFunction = <T>(
  file: IFileType,
  div: Element,
  ...args: T[]) => T | void

export interface ITriggerType {
  [key: string]: triggerFunction
  default: triggerFunction
}


export interface ICustomTriggerObject {
  [key: string]: Element[]
}

export interface ITriggerElements {
  [key: string]: Element[] | ICustomTriggerObject
  defaults: Element[];
  custom: ICustomTriggerObject;
}
