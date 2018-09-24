
import { FileRenderer } from './src/ts/FileRenderer'
import { FileFormatter } from './src/ts/FileFormatter'

declare module "*.md" {
    const value: any;
    export default value;
}

declare global {

    interface ArrayConstructor {
        from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;
        from<T>(arrayLike: ArrayLike<T>): Array<T>;
    }

    type FileRendererOptions = {
        ext?: string,
        flag?: RegExp,
        defaultCssSelector?: string,
        triggers?: triggerType
    }

    type fileType = { name: string, data: string }

    type emitDefault = (
        this: FileRenderer,
        file: fileType,
        fieldIndex: number,
        ...args: any[]
    ) => any

    type emitCustom = <T>(
        reference: FileRenderer,
        file: fileType,
        divs: Element[],
        ...args: T[]
    ) => T | void

    type triggerType = {
        [key: string]: emitCustom
        default: emitCustom
    }
}
