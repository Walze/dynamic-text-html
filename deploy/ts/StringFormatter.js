"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = __importDefault(require("marked"));
const util_1 = require("util");
/** Helper for getting a StringFormatter instance */
exports.SF = (text) => new StringFormatter(text);
/**
 * Used to help format strings
 */
class StringFormatter {
    constructor(text) {
        /**
         * Splits on every line break
         */
        this.splitOnN = (text, trim = false) => {
            const t1 = trim ? text.trim() : text;
            return t1
                .split('\n')
                .filter((t) => t.match(/[^\s]/));
        };
        this._replaceMarkClasses = (...match) => {
            const { 3: text } = match;
            const classes = match[2] ? match[2].split(' ') : undefined;
            const breakLine = Boolean(match[1]);
            const el = breakLine ? 'div' : 'span';
            const newWord = exports.SF(text)
                .makeElement(el, classes);
            return newWord;
        };
        if (!util_1.isString(text)) {
            console.error('Given ', text);
            throw new Error(`constructor expected string`);
        }
        if (text === '')
            console.info(`${this.constructor.name} got empty string in constructor`, this.string());
        this._STRING = text;
    }
    /**
     * return instance string
     */
    string() {
        return this._STRING;
    }
    /**
     *  removes ./
     */
    removeDotSlash() {
        return exports.SF(this._STRING.replace(/^\.\//g, ''));
    }
    /**
     * Removes <p></p>
     */
    removePTag() {
        return exports.SF(this._STRING
            .replace(/<p>/gu, '')
            .replace(/<\/p>/gu, ''));
    }
    removeComments() {
        return exports.SF(this._STRING.replace(/\{\{[^{}]*\}\}/gu, ''));
    }
    markdown() {
        return exports.SF(marked_1.default(exports.SF(this._STRING)
            ._markClasses()
            .string()));
    }
    /**
     * marks custom classes
     */
    _markClasses() {
        const regex = /(!?)\{([^{}]+)*\}(\S+)/ug;
        const newString = this._STRING
            .replace(regex, this._replaceMarkClasses.bind(this));
        return exports.SF(newString);
    }
    /**
     * Makes an in-line element
     *
     * @param tag tag name
     * @param classArray array of css classes
     * @param id element id
     */
    makeElement(tag, classArray, id) {
        const classes = classArray ? classArray.join(' ') : undefined;
        const classesString = classes ? `class="${classes}"` : '';
        const idString = id ? `id="${id}" ` : '';
        return `<${tag} ${idString}${classesString}>${this._STRING}</${tag}>`;
    }
    /**
     * Makes an in-line element
     *
     * @param tag tag name
     * @param classArray array of css classes
     * @param id element id
     */
    makeInlineMarkedElement(tag, classArray, id) {
        return this
            .markdown()
            .removePTag()
            .makeElement(tag, classArray, id);
    }
    /**
     * Makes an in-line string
     */
    makeInlineMarkedText() {
        return this
            .markdown()
            .removePTag()
            .string();
    }
    /**
     *  Maps array then joins it
     *
     * @param array initial array
     * @param callback map callback
     * @param returnInstance return instance of this?
     * @param join join string
     */
    static mapJoin(array, callback, returnInstance = false, join = '') {
        const arr = array
            .map(callback)
            .join(join);
        return returnInstance ? exports.SF(arr) : arr;
    }
}
exports.StringFormatter = StringFormatter;
//# sourceMappingURL=StringFormatter.js.map