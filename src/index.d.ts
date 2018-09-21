
import FileRenderer from './js/FileRenderer'
import FileFormatter from './js/FileFormatter'

declare module 'dynamic-text-html' {

    export const mapObj = (
        object: {},
        cb: (value: any, prop: string, index: number) => any
    ): {} => { }


    export const mapObjToArray = (
        object: {},
        cb: (value: any, prop: string, index: number) => any
    ): any[] => { }


    export const fetchMakeFile = (ext: string): (path: string, name: string) => Promise<fileType> => { }


    export const fetchFiles = (urlsObj, ext = 'md'): Promise<fileType>[] => { }

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


    type FileRendererOptions = {
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
