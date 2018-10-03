export declare class FileFormatter {
    flag: RegExp;
    defaultCssSelector: string;
    protected constructor(flag?: RegExp, defaultCssSelector?: string);
    matchFlag(text: string): string | undefined;
    replaceFlag(text: string, replaceWith?: string): string;
    everyNthLineBreak(text: string, everyN: number): string[];
}
//# sourceMappingURL=FileFormatter.d.ts.map