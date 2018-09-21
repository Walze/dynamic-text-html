
import { FileRenderer } from './js/FileRenderer'
import { FileFormatter } from './js/FileFormatter'

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

    type emitCustom = (
        this: FileRenderer,
        file: fileType,
        divs: Element[],
        ...args: any[]
    ) => any

    type triggerType = {
        [key: string]: emitCustom | undefined
        default?: emitCustom
    }
}
