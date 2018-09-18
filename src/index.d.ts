
import Renderer from './js/Renderer'

declare global {
    export { Renderer }

    export type fileType = { name: string, data: string }

    export type emitDefault = (
        this: Renderer,
        file: fileType,
        fieldIndex: number,
        ...args: any[]
    ) => any

    export type emitCustom = (
        this: Renderer,
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