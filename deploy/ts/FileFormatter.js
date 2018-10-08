"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileFormatter {
    constructor(flag = /<<(.+)>>/u, defaultCssSelector = '[field]') {
        this.flag = flag;
        this.defaultCssSelector = defaultCssSelector;
    }
    matchFlag(text) {
        const matched = text.match(this.flag);
        return matched ? matched[1] : undefined;
    }
    replaceFlag(text, replaceWith = '\n') {
        return text.replace(this.flag, replaceWith);
    }
}
exports.FileFormatter = FileFormatter;
//# sourceMappingURL=FileFormatter.js.map