
import FileRenderer from './js/FileRenderer'
import FileFormatter from './js/FileFormatter'

declare global {

    export class StringFormatter {

        constructor(string: string)

        string(): string

        removePTag(): StringFormatter

        removeComments(): StringFormatter

        markdown(): StringFormatter

        markClasses(): StringFormatter

        makeElement(el: string, classArray: string[], id: string = null): string

    }


    export class FileFormatter {

        flag: string
        defaultCssSelector: string

        constructor(flag?: RegExp, defaultCssSelector?: string)

        matchFlag(text: string): string | null

        replaceFlag(text: string, replaceWith: string = '\n'): string

        everyNthLineBreak(text: string, everyN = 0): string[]
    }


    export type FileRendererOptions = {
        ext?: string,
        flag?: RegExp,
        defaultCssSelector?: string,
        triggers?: triggerParamType
    }
    export class FileRenderer extends FileFormatter {

        triggers: triggerType
        ext: string

        constructor(options: FileRendererOptions)

        render(file: fileType): any

        renderFatherChildren(
            lines: string[],
            fathers: Element[],
            selectors: string[]
        )


    }


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
