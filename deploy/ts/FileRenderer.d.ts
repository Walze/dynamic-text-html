import '../css/dynamic-files.css';
import { FileFormatter } from './FileFormatter';
import { IFileType, IElAttr } from '../types';
export declare class FileRenderer extends FileFormatter {
    ext: string;
    fields: IElAttr[];
    lines: IElAttr[];
    files: IFileType[];
    constructor(ext?: string);
    /**
     *  gets element by attribute and gets attributes value
     */
    private _getElAttr;
    findElAttr(name: string): {
        field: IElAttr | undefined;
        line: IElAttr | undefined;
    };
    render(file: IFileType): void;
    private _renderField;
    private _renderLines;
    private _replaceExternal;
    private _setFileNameToggle;
    private _listenKeysToShowFileNames;
    private _checkValidFile;
}
//# sourceMappingURL=FileRenderer.d.ts.map