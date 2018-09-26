"use strict";
exports.__esModule = true;
var marked_1 = require("marked");
var util_1 = require("util");
/** Helper for using StringFormatter */
exports.SF = function (text) { return new StringFormatter(text); };
var StringFormatter = /** @class */ (function () {
    function StringFormatter(text) {
        this._newThis = function (text) { return new StringFormatter(text); };
        if (!util_1.isString(text)) {
            console.error('String: ', text);
            throw new Error("constructor expected string");
        }
        this._STRING = text;
    }
    StringFormatter.prototype.string = function () {
        return this._STRING;
    };
    StringFormatter.prototype.removeDotSlash = function () {
        return this._newThis(this._STRING.replace(/^\.\//g, ''));
    };
    StringFormatter.prototype.removePTag = function () {
        return this._newThis(this._STRING
            .replace(/<p>/gu, '')
            .replace(/<\/p>/gu, ''));
    };
    StringFormatter.prototype.removeComments = function () {
        return this._newThis(this._STRING.replace(/\{\{[^]*\}\}/gu, ''));
    };
    /**
     * adds marked.js to string
     */
    StringFormatter.prototype.markdown = function () {
        return this._newThis(marked_1["default"](this._STRING));
    };
    StringFormatter.prototype._replaceMarkClasses = function () {
        var match = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            match[_i] = arguments[_i];
        }
        var text = match[3];
        this._STRING = text;
        var classes = match[2] ? match[2].split(' ') : undefined;
        var breakLine = Boolean(match[1]);
        var el = breakLine ? 'div' : 'span';
        var newWord = this.makeElement(el, classes);
        return newWord;
    };
    /**
     * marks custom classes
     */
    StringFormatter.prototype.markClasses = function () {
        var regex = /(!?)\{([^{}]+)*\}(\S+)/ug;
        var newString = this._STRING
            .replace(regex, this._replaceMarkClasses.bind(this));
        return this._newThis(newString);
    };
    StringFormatter.prototype.makeElement = function (el, classArray, id) {
        var classes = classArray ? classArray.join(' ') : undefined;
        var classesString = classes ? "class=\"" + classes + "\"" : '';
        var idString = id ? "id=\"" + id + "\"" : '';
        return "<" + el + " " + idString + " " + classesString + ">" + this._STRING + "</" + el + ">";
    };
    return StringFormatter;
}());
exports.StringFormatter = StringFormatter;
