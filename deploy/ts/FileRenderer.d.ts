import '../../public/css/dynamic-files.css';
import { FileFormatter } from './FileFormatter';
import { ITriggerType, IFileRendererOptions, IFileType } from '../types';
export declare class FileRenderer extends FileFormatter {
    triggers: ITriggerType;
    ext: string | 'md';
    constructor(options?: IFileRendererOptions);
    render(file: IFileType): void | {};
    private _triggerRender;
    /**
     * Renders each line to its respective selector inside of parent
     */
    renderMultipleLines: (parent: Element, lines: string[], selectors: string[]) => void;
    private _renderDefaultFactory;
    private _displayFileNameToggle;
    private _fieldClickFactory;
    private _checkValidFile;
}
//# sourceMappingURL=FileRenderer.d.ts.map