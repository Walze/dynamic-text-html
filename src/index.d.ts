
import Formatter from './js/Formatter'

declare global {
    export { Formatter }

    export type fileType = { name: string, data: string }

    export type emitDefault = (
        this: Formatter,
        file: fileType,
        fieldIndex: number,
        ...args: any[]
    ) => any

    export type emitCustom = (
        this: Formatter,
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