/** Helper for getting a StringFormatter instance */
export declare const SF: (text: string) => StringFormatter;
/**
 * Used to help format strings
 */
export declare class StringFormatter {
    private _STRING;
    constructor(text: string);
    /**
     * return instance string
     */
    string(): string;
    /**
     *  removes ./
     */
    removeDotSlash(): StringFormatter;
    /**
     * Removes <p></p>
     */
    removePTag(): StringFormatter;
    removeComments(): StringFormatter;
    markdown(): StringFormatter;
    private _replaceMarkClasses;
    /**
     * marks custom classes
     */
    private _markClasses;
    /**
     * Makes an in-line element
     *
     * @param tag tag name
     * @param classArray array of css classes
     * @param id element id
     */
    makeElement(tag: string, classArray?: string[], id?: string | undefined): string;
    /**
     * Makes an in-line element
     *
     * @param tag tag name
     * @param classArray array of css classes
     * @param id element id
     */
    makeInlineMarkedElement(tag: string, classArray?: string[], id?: string | undefined): string;
    /**
     *  Maps array then joins it
     *
     * @param array initial array
     * @param callback map callback
     * @param returnInstance return instance of this?
     * @param join join string
     */
    static mapJoin<A, B>(array: A[], callback: (value: A, index: number, array: A[]) => B, returnInstance?: boolean, join?: string): string | StringFormatter;
}
//# sourceMappingURL=StringFormatter.d.ts.map