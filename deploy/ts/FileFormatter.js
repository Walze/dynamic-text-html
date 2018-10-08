"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FileFormatter {
    constructor(flag = /<<(.+)>>/u, defaultCssSelector = '[field]') {
        this.flag = flag;
        this.defaultCssSelector = defaultCssSelector;
        /**
         * Splits on every line break
         */
        this.splitOnN = (text, trim = false) => {
            const t1 = trim ? text.trim() : text;
            return t1
                .split('\n')
                .filter((t) => t.match(/[^\s]/));
        };
        this.everyNthLineBreak = (text, everyN) => {
            const regex = /\r\n|\r|\n/ug;
            const lines = text
                .trim()
                .split(regex);
            if (everyN <= 0)
                return lines;
            const groups = [];
            /** Blocks consecutive breaks */
            let blocked = false;
            let groupsIndex = 0;
            let breakCounter = 0;
            lines.map((line) => {
                let goToNextGroup = false;
                const isEmpty = line === '';
                if (!groups[groupsIndex])
                    groups[groupsIndex] = '';
                if (isEmpty)
                    breakCounter++;
                else
                    breakCounter = 0;
                // if breakcounter matches param
                goToNextGroup = breakCounter === everyN && everyN !== 0;
                groups[groupsIndex] += `${line}\r\n`;
                if (!goToNextGroup)
                    blocked = false;
                if (goToNextGroup && !blocked) {
                    groupsIndex++;
                    blocked = true;
                }
            });
            return groups;
        };
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