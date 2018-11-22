import '../../css/dynamic-files.css';
import { IFileType, IElAttr } from '../types';
export declare class FileRenderer {
    ext: string;
    selectorReference: Element | Document;
    fields: IElAttr[];
    lines: IElAttr[];
    files: IFileType[];
    constructor(ext?: string, selectorReference?: Element | Document);
    /**
     *  gets element by attribute and gets attributes value
     */
    private _getElAttr;
    updateFieldAndLines(): void;
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
    private _checkElementInBody;
}
//# sourceMappingURL=FileRenderer.d.ts.map