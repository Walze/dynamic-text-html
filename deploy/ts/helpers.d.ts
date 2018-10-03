import { FileRenderer } from "./FileRenderer";
import { IFileType, IparcelGlob } from "../types";
export declare const mapObj: <A, B>(object: {
    [key: string]: A;
}, cb: (value: A, prop: string, index: number) => B) => {
    [key: string]: B;
};
export declare const mapObjToArray: <A, B>(object: {
    [key: string]: A;
}, cb: (value: A, prop: string, index: number) => B) => B[];
export declare const makeFile: (fileName: string, fileData: string) => IFileType;
export declare const fetchFiles: (urlsObj: {
    [key: string]: string;
}, ext: string) => Promise<IFileType>[];
export declare const renderParcelFiles: (filesUrls: IparcelGlob, renderer: FileRenderer) => Promise<void | {}>[];
//# sourceMappingURL=helpers.d.ts.map