"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../css/dynamic-files.css");
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
            const newText = div.outerHTML.trim();
            return newText;
        };
        this._displayFileNameToggle = (fileName, el) => {
            const overlay = document.createElement('div');
            overlay.classList.add('show-file-name');
            overlay.innerHTML = `<span>${fileName}</span>`;
            el.classList.add('dynamic');
            el.appendChild(overlay);
        };
        this._listenKeysToShowFileNames = () => {
            let obj = {
                z: false,
                x: false,
                c: false,
            };
            const objReset = obj;
            let showFiles;
            let state = false;
            window.addEventListener('keydown', ({ key }) => {
                if (obj.hasOwnProperty(key))
                    obj[key] = true;
                if (!showFiles)
                    showFiles = Array.from(document.querySelectorAll(`.show-file-name`));
                if (obj.z && obj.x && obj.c) {
                    showFiles.map((el) => !state ? el.classList.add('active') : el.classList.remove('active'));
                    state = !state;
                    obj = objReset;
                }
            });
            window.addEventListener('keyup', ({ key }) => {
                if (obj.hasOwnProperty(key))
                    obj[key] = false;
            });
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
        // show divs
        this._listenKeysToShowFileNames();
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
}
exports.FileRenderer = FileRenderer;
//# sourceMappingURL=FileRenderer.js.map