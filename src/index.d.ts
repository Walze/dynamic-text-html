
import Formatter from './js/Formatter'

declare global {
    export { Formatter }

    export type fileType = { name: string, data: string }

    export type emitDefault = (
        ref: Formatter,
        file: fileType,
        fieldIndex: number,
        ...args: any[]
    ) => any

    export type emitCustom = (
        ref: Formatter,
        file: fileType,
        divs: Element[],
        ...args: any[]
    ) => any

    export type triggerType = { name: string, fire: emitDefault }

    export type triggerParamType = { [key: string]: emitCustom }
}