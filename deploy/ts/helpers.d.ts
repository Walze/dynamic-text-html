import { IParcelGlob } from './../types';
import { IFileType } from "../types";
export declare const mapObj: <A, B>(object: {
    [key: string]: A;
}, cb: (value: A, prop: string, index: number) => B) => {
    [key: string]: B;
};
export declare const mapObjToArray: <A, B>(object: {
    [key: string]: A;
}, cb: (value: A, prop: string, index: number) => B) => B[];
export declare const makeFile: (name: string, data: string) => IFileType;
export declare const fetchMakeFile: (ext: string) => (path: string, name: string) => Promise<IFileType>;
export declare const fetchFiles: (urlsObj: IParcelGlob, ext: string) => Promise<IFileType>[];
export declare const fetchFilesPromise: (filesUrls: IParcelGlob, ext: string) => (callback: (file: IFileType) => void) => Promise<void>[];
//# sourceMappingURL=helpers.d.ts.map