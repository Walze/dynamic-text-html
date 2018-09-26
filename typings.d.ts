
import { FileRenderer } from './src/ts/FileRenderer'

declare module "*.md" {
    const value: any;
    export default value;
}


export interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
    from<T>(arrayLike: ArrayLike<T>): Array<T>;
}

export type FileRendererOptions = {
    ext?: string,
    flag?: RegExp,
    defaultCssSelector?: string,
    triggers?: triggerType
}

export type fileType = { name: string, data: string }

export type emitDefault = <T>(
    this: FileRenderer,
    file: fileType,
    fieldIndex: number,
    ...args: any[]
) => T | void

export type emitCustom = <T>(
    reference: FileRenderer,
    file: fileType,
    divs: Element[],
    ...args: T[]
) => T | void

export type triggerType = {
    [key: string]: emitCustom
    default: emitCustom
}
