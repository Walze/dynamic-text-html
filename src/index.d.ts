
import Formatter from './js/Formatter'

declare global {
    export { Formatter }

    export type fileType = { name: string, data: string }

    export type emit = (ref: Formatter, file: fileType, ...args: any[]) => any

    export type triggerType = { name: string, fire: emit }

    export type triggerParamType = { [key: string]: emit }
}