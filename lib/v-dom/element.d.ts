export default function CreateElement(tagName: any, props: any, children?: any): Element;
declare class Element {
    constructor(tagName: any, props: any, children: any);
    tagName: any;
    props: any;
    children: any;
    key: any;
    count: number;
    render(): any;
}
export {};
