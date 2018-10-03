"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = __importDefault(require("marked"));
const util_1 = require("util");
/** Helper for using StringFormatter */
exports.SF = (text) => new StringFormatter(text);
class StringFormatter {
    constructor(text) {
        this._newThis = (text) => new StringFormatter(text);
        if (!util_1.isString(text)) {
            console.error('String: ', text);
            throw new Error(`constructor expected string`);
        }
        this._STRING = text;
    }
    string() {
        return this._STRING;
    }
    removeDotSlash() {
        return this._newThis(this._STRING.replace(/^\.\//g, ''));
    }
    removePTag() {
        return this._newThis(this._STRING
            .replace(/<p>/gu, '')
            .replace(/<\/p>/gu, ''));
    }
    removeComments() {
        return this._newThis(this._STRING.replace(/\{\{[^{}]*\}\}/gu, ''));
    }
    /**
     * adds marked.js to string
     */
    markdown() {
        return this._newThis(marked_1.default(this._STRING));
    }
    _replaceMarkClasses(...match) {
        const { 3: text } = match;
        this._STRING = text;
        const classes = match[2] ? match[2].split(' ') : undefined;
        const breakLine = Boolean(match[1]);
        const el = breakLine ? 'div' : 'span';
        const newWord = this.makeElement(el, classes);
        return newWord;
    }
    /**
     * marks custom classes
     */
    markClasses() {
        const regex = /(!?)\{([^{}]+)*\}(\S+)/ug;
        const newString = this._STRING
            .replace(regex, this._replaceMarkClasses.bind(this));
        return this._newThis(newString);
    }
    makeElement(el, classArray, id) {
        const classes = classArray ? classArray.join(' ') : undefined;
        const classesString = classes ? `class="${classes}"` : '';
        const idString = id ? ` id="${id}" ` : '';
        return `<${el}${idString}${classesString}>${this._STRING}</${el}>`;
    }
    makeInlineMarkedElement(el, classArray, id) {
        return this
            .markdown()
            .removePTag()
            .makeElement(el, classArray, id);
    }
    static mapJoin(array, callback, returnInstance = false, join = '') {
        const arr = array
            .map(callback)
            .join(join);
        return returnInstance ? exports.SF(arr) : arr;
    }
}
exports.StringFormatter = StringFormatter;
//# sourceMappingURL=StringFormatter.js.map