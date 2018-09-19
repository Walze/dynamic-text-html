
import FileRenderer from './js/FileRenderer'

declare global {
    export { FileRenderer }

    export type fileType = { name: string, data: string }

    export type emitDefault = (
        this: FileRenderer,
        file: fileType,
        fieldIndex: number,
        ...args: any[]
    ) => any

    export type emitCustom = (
        this: FileRenderer,
        file: fileType,
        divs: Element[],
        ...args: any[]
    ) => any

    export type triggerType = {
        [key: string]: emitCustom
        default?: (fields: Element[]) => any
    }

    export type triggerParamType = {
        [key: string]: emitCustom
        default?: (fields: Element[]) => any
    }
}