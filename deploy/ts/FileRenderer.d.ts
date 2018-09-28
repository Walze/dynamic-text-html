import '../../public/css/dynamic-files.css';
import { FileFormatter } from './FileFormatter';
import { ITriggerType, IFileRendererOptions, IFileType } from '../types';
export declare class FileRenderer extends FileFormatter {
    triggers: ITriggerType;
    ext: string | 'md';
    constructor(options?: IFileRendererOptions);
    render(file: IFileType): void | {};
    private _emitTrigger;
    renderFatherChildren: (lines: string[] | string[][], fathers: Element[], selectors: string[]) => void;
    private _renderDefaultFactory;
    private _displayFileNameToggle;
    private _fieldClickFactory;
    private _checkValidFile;
}
