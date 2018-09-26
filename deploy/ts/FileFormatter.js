"use strict";
exports.__esModule = true;
var FileFormatter = /** @class */ (function () {
    function FileFormatter(flag, defaultCssSelector) {
        if (flag === void 0) { flag = /<<(.+)>>/u; }
        if (defaultCssSelector === void 0) { defaultCssSelector = '[field]'; }
        this.flag = flag;
        this.defaultCssSelector = defaultCssSelector;
    }
    FileFormatter.prototype.matchFlag = function (text) {
        var matched = text.match(this.flag);
        return matched ? matched[1] : undefined;
    };
    FileFormatter.prototype.replaceFlag = function (text, replaceWith) {
        if (replaceWith === void 0) { replaceWith = '\n'; }
        return text.replace(this.flag, replaceWith);
    };
    FileFormatter.prototype.everyNthLineBreak = function (text, everyN) {
        if (everyN === void 0) { everyN = 0; }
        var lines = this
            .replaceFlag(text, '')
            .trim()
            .split(/\r\n|\r|\n/ug);
        var groups = [];
        /** Blocks consecutive breaks */
        var blocked = false;
        var groupsIndex = 0;
        var breakCounter = 0;
        lines.map(function (line) {
            var goToNextGroup = false;
            var isEmpty = line === '';
            if (!groups[groupsIndex])
                groups[groupsIndex] = '';
            if (isEmpty)
                breakCounter++;
            else
                breakCounter = 0;
            // if breakcounter matches param
            goToNextGroup = breakCounter === everyN && everyN !== 0;
            groups[groupsIndex] += line + "\r\n";
            if (!goToNextGroup)
                blocked = false;
            if (goToNextGroup && !blocked) {
                groupsIndex++;
                blocked = true;
            }
        });
        return groups;
    };
    return FileFormatter;
}());
exports.FileFormatter = FileFormatter;
