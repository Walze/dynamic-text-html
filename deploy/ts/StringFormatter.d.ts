/** Helper for using StringFormatter */
export declare const SF: (text: string) => StringFormatter;
export declare class StringFormatter {
    private _STRING;
    constructor(text: string);
    private _newThis;
    string(): string;
    removeDotSlash(): StringFormatter;
    removePTag(): StringFormatter;
    removeComments(): StringFormatter;
    /**
     * adds marked.js to string
     */
    markdown(): StringFormatter;
    private _replaceMarkClasses;
    /**
     * marks custom classes
     */
    markClasses(): StringFormatter;
    makeElement(el: string, classArray?: string[], id?: string | undefined): string;
    makeInlineMarkedElement(el: string, classArray?: string[], id?: string | undefined): string;
    static mapJoin<A, B>(array: A[], callback: (value: A, index: number, array: A[]) => B, returnInstance?: boolean, join?: string): string | StringFormatter;
}
//# sourceMappingURL=StringFormatter.d.ts.map