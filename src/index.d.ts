
import { FileRenderer } from './js/FileRenderer'
import { FileFormatter } from './js/FileFormatter'

declare global {

    type FileRendererOptions = {
        ext?: string,
        flag?: RegExp,
        defaultCssSelector?: string,
        triggers?: triggerParamType
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
        [key: string]: emitCustom
        default?: (fields: Element[]) => any
    }

    type triggerParamType = {
        [key: string]: emitCustom
        default?: (fields: Element[]) => any
    }
}
