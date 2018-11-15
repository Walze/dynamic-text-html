"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../public/css/dynamic-files.css");
const StringFormatter_1 = require("./StringFormatter");
const FileFormatter_1 = require("./FileFormatter");
const util_1 = require("util");
// tslint:disable-next-line:max-classes-per-file
class FileRenderer extends FileFormatter_1.FileFormatter {
    constructor(ext = 'md') {
        super();
        this.ext = ext;
        this.files = [];
        this._getElAttr = (name) => Array
            .from(document.querySelectorAll(`[${name}]`))
            .map((el) => ({
            el,
            name: el.getAttribute(name),
        }));
        this._renderLines = ({ el }, data) => {
            const linesArray = StringFormatter_1.SF(data)
                .everyNthLineBreak(1)
                .map((line) => StringFormatter_1.SF(line)
                .markdown()
                .removePTag()
                .string()
                .trim());
            Array
                .from(el.querySelectorAll('[line]'))
                .map((line, i) => line.innerHTML = linesArray[i]);
        };
        this._replaceExternal = (el) => (...args) => {
            const [, external] = args;
            const div = el.querySelector(`[external = ${external}]`);
            const newText = div.innerHTML.trim();
            return newText;
        };
        this._fieldClickFactory = (overlay) => {
            let active = false;
            return (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                active = !active;
                if (active)
                    overlay.classList.add('active');
                else
                    overlay.classList.remove('active');
            };
        };
        this._checkValidFile = (file) => {
            if (!util_1.isString(file.name))
                throw new Error('file name is not string');
            if (!util_1.isString(file.data))
                throw new Error('file data is not string');
            if (file.name === '')
                throw new Error('file name is empty');
            if (file.data === '')
                console.warn('file data is empty');
        };
        this.fields = this._getElAttr('field');
        this.lines = this._getElAttr('lines');
    }
    findElAttr(name) {
        const field = this.fields.find((fieldI) => `${fieldI.name}.${this.ext}` === name);
        const line = this.lines.find((lineI) => `${lineI.name}.${this.ext}` === name);
        return { field, line };
    }
    render(file) {
        this._checkValidFile(file);
        this.files.push(file);
        const data = StringFormatter_1.SF(file.data)
            .removeComments()
            .string();
        const { field, line } = this.findElAttr(file.name);
        if (field) {
            this._renderField(field, data);
            this._displayFileNameToggle(file.name, field.el);
        }
        if (line) {
            this._renderLines(line, data);
            this._displayFileNameToggle(file.name, line.el);
        }
    }
    _renderField({ el }, data) {
        const replacedText = data
            .replace(/\[\[(.+)\]\]/gu, this._replaceExternal(el))
            .replace(/>\s+</g, "><");
        el.innerHTML = StringFormatter_1.SF(replacedText)
            .markdown()
            .string();
    }
    _displayFileNameToggle(fileName, el) {
        const overlay = document.createElement('div');
        overlay.classList.add('show-file-name');
        overlay.innerHTML = fileName;
        el.classList.add('dynamic');
        el.insertBefore(overlay, el.firstChild);
        const click = this._fieldClickFactory(overlay);
        let zPressed = false;
        window.addEventListener('keyup', (ev) => {
            const isNotZ = ev.key !== 'z';
            if (isNotZ)
                return;
            zPressed = isNotZ;
        });
        window.addEventListener('keydown', (ev) => zPressed = ev.key === 'z');
        el
            .addEventListener('pointerup', (ev) => zPressed ? click(ev) : undefined);
    }
}
exports.FileRenderer = FileRenderer;
//# sourceMappingURL=FileRenderer.js.map