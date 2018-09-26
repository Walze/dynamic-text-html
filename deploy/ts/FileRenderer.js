"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
require("../styles/dynamic-files.css");
var StringFormatter_1 = require("./StringFormatter");
var FileFormatter_1 = require("./FileFormatter");
var util_1 = require("util");
var FileRenderer = /** @class */ (function (_super) {
    __extends(FileRenderer, _super);
    function FileRenderer(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options.flag, options.defaultCssSelector) || this;
        _this.renderFatherChildren = function (lines, fathers, selectors) {
            // iterates fathers
            fathers.map(function (father, fatherI) {
                // iterates selectors
                selectors.map(function (selector, selectorI) {
                    var children = Array.from(father.querySelectorAll(selector));
                    // iterates children
                    children.map(function (child, childI) {
                        var multiply = childI * selectors.length;
                        var index = selectorI + multiply;
                        // if 2 dimentional array test
                        var line = Array.isArray(lines[0]) ?
                            lines[fatherI][index] :
                            lines[index];
                        var markedText = StringFormatter_1.SF(line)
                            .markClasses()
                            .markdown()
                            .removePTag()
                            .string();
                        child.innerHTML = markedText;
                    });
                });
            });
        };
        _this._fieldClickFactory = function (overlay) {
            var active = false;
            return function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                active = !active;
                if (active)
                    overlay.classList.add('active');
                else
                    overlay.classList.remove('active');
            };
        };
        _this._checkValidFile = function (file) {
            if (!util_1.isString(file.name))
                throw new Error('file name is not string');
            if (!util_1.isString(file.data))
                throw new Error('file data is not string');
            if (file.name === '')
                throw new Error('file name is empty');
            if (file.data === '')
                console.warn('file name is empty');
        };
        // sets addon if it exists in triggers
        var defaultAddon = options.triggers && options.triggers["default"]
            ? options.triggers["default"]
            : undefined;
        _this.triggers = __assign({}, options.triggers, { "default": _this._renderDefaultFactory(_this.defaultCssSelector, defaultAddon) });
        _this.ext = options.ext || 'md';
        return _this;
    }
    FileRenderer.prototype.render = function (file) {
        this._checkValidFile(file);
        file.data = StringFormatter_1.SF(file.data)
            .removeComments()
            .string();
        // if didn't match, it's a default
        var customTrigger = this.matchFlag(file.data);
        var firedTriggersReturn = customTrigger
            ? this._emitTrigger(customTrigger, file)
            : this._emitTrigger('default', file);
        return firedTriggersReturn;
    };
    FileRenderer.prototype._emitTrigger = function (triggerName, file) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var _a;
        if (triggerName === 'default') {
            return (_a = this.triggers)["default"].apply(_a, [this, file, []].concat(args));
        }
        // Takes "name" from "name.extension"
        var regex = new RegExp("(.+)." + this.ext, 'u');
        var match = file.name.match(regex);
        if (!match)
            throw new Error('file did not match RegEx');
        // selects custom divs
        var selector = "[" + match[1] + "]";
        var divs = Array
            .from(document.querySelectorAll(selector))
            .map(function (div) {
            _this._displayFileNameToggle(file.name, div);
            return div;
        });
        var customTrigger = this.triggers[triggerName];
        return customTrigger ? customTrigger.apply(void 0, [this, file, divs].concat(args)) : undefined;
    };
    FileRenderer.prototype._renderDefaultFactory = function (defaultCssSelector, defaultAddon) {
        var _this = this;
        // Only gets run once
        var fields = Array.from(document.querySelectorAll(defaultCssSelector));
        var fieldIndex = 0;
        var renderDefault = function (_, file) {
            var __ = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                __[_i - 2] = arguments[_i];
            }
            var field = fields[fieldIndex++];
            if (defaultAddon)
                defaultAddon(_this, file, [field]);
            var markedText = StringFormatter_1.SF(file.data)
                .removeComments()
                .markClasses()
                .markdown()
                .string();
            field.innerHTML = markedText;
            _this._displayFileNameToggle(file.name, field);
        };
        return renderDefault;
    };
    FileRenderer.prototype._displayFileNameToggle = function (fileName, field) {
        var overlay = document.createElement('div');
        overlay.classList.add('show-file-name');
        overlay.innerHTML = fileName;
        field.classList.add('dynamic');
        field.insertBefore(overlay, field.firstChild);
        var click = this._fieldClickFactory(overlay);
        var zPressed = false;
        window.addEventListener('keyup', function (ev) {
            var isNotZ = ev.key !== 'z';
            if (isNotZ)
                return;
            zPressed = isNotZ;
        });
        window.addEventListener('keydown', function (ev) { return zPressed = ev.key === 'z'; });
        field
            .addEventListener('pointerup', function (ev) { return zPressed ? click(ev) : undefined; });
    };
    return FileRenderer;
}(FileFormatter_1.FileFormatter));
exports.FileRenderer = FileRenderer;
