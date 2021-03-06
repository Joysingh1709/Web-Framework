/**
 * @param {Node} node
 * @param {Options} [options]
 * @returns {HastNode}
 */
export function fromDom(node: Node, options?: Options): HastNode;
export type HastParent = import('hast').Parent;
export type HastRoot = import('hast').Root;
export type HastDoctype = import('hast').DocType;
export type HastElement = import('hast').Element;
export type HastText = import('hast').Text;
export type HastComment = import('hast').Comment;
export type HastChild = HastParent['children'][number];
export type HastNode = HastChild | HastRoot;
/**
 * Function called when a DOM node is transformed into a hast node
 */
export type AfterTransform = (domNode: Node, hastNode: HastNode | undefined) => void;
export type Options = {
    afterTransform?: AfterTransform;
};
export type Context = {
    afterTransform?: AfterTransform;
};
