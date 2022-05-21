declare module 'hyperscript' {
    export interface HyperScript {
        /** Creates an Element */
        <T extends keyof ElementTagNameMap>(tagName: T, attrs?: Object, ...children: any[]): ElementTagNameMap[T];
        <T extends Element>(tagName: string, attrs?: Object, ...children: any[]): T;
        /** Cleans up any event handlers created by this hyperscript context */
        cleanup(): void;
        /** Creates a new hyperscript context */
        context(): HyperScript;
    }

    const h: HyperScript;
    export = h;
}

declare module 'diff-dom' {
    export class DiffDOM {
        constructor(options?: {});
        options: {};
        DiffFinder: any;
        apply(tree: any, diffs: any): any;
        undo(tree: any, diffs: any): any;
        diff(t1Node: any, t2Node: any): any;
    }

    export function stringToObj(string: any): any;

    export function nodeToObj(
        aNode: any,
        options?: {}
    ): {
        nodeName: any;
        data: any;
        attributes: {};
        value: any;
        childNodes: any[];
        checked: any;
        selected: any;
    };
}
