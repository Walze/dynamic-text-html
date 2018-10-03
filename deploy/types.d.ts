import { FileRenderer } from './ts/FileRenderer';
declare global {
    interface IArrayConstructor {
        from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
        from<T>(arrayLike: ArrayLike<T>): T[];
    }
}
export interface IparcelGlob {
    [key: string]: string | {};
    default: {
        [key: string]: string;
    };
}
export interface IFileRendererOptions {
    ext?: string;
    flag?: RegExp;
    defaultCssSelector?: string;
    triggers?: ITriggerType;
}
export interface IFileType {
    name: string;
    data: string;
}
export declare type emitDefault = <T>(this: FileRenderer, file: IFileType, fieldIndex: number, ...args: T[]) => T | void;
export declare type emitCustom = <T>(reference: FileRenderer, file: IFileType, divs: Element[], ...args: T[]) => T | void;
export interface ITriggerType {
    [key: string]: emitCustom;
    default: emitCustom;
}
//# sourceMappingURL=types.d.ts.map