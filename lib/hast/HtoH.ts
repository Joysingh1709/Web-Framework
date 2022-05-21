// import { html, svg, find, hastToReact } from 'property-information';
// import { stringify as spaces } from 'space-separated-tokens';
// import { stringify as commas } from 'comma-separated-tokens';
// import style from 'style-to-object';
// import { webNamespaces } from 'web-namespaces';
// import { convert } from 'unist-util-is';
//
// const ns: Record<string, string> = /** @type {Record<string, string>} */ webNamespaces;
// const toReact: Record<string, string> = /** @type {Record<string, string>} */ hastToReact;
//
// const own = {}.hasOwnProperty;
//
// const root = convert('root');
// const element = convert('element');
// const text = convert('text');
//
// export function toH(h: any, tree: any, options: any): any {
//     if (typeof h !== 'function') {
//         throw new TypeError('h is not a function');
//     }
//
//     const r: boolean = react(h);
//     const v: boolean = vue(h);
//     const vd: boolean = vdom(h);
//     let prefix: any;
//     let node: any;
//
//     if (typeof options === 'string' || typeof options === 'boolean') {
//         prefix = options;
//         options = {};
//     } else {
//         if (!options) options = {};
//         prefix = options.prefix;
//     }
//
//     if (root(tree)) {
//         node =
//             tree['children'].length === 1 && element(tree['children'][0])
//                 ? tree['children'][0]
//                 : {
//                       type: 'element',
//                       tagName: 'div',
//                       properties: {},
//                       children: tree['children'],
//                   };
//     } else if (element(tree)) {
//         node = tree;
//     } else {
//         throw new Error('Expected root or element, not `' + ((tree && tree.type) || tree) + '`');
//     }
//
//     return transform(h, node, {
//         schema: options.space === 'svg' ? svg : html,
//         prefix: prefix === undefined || prefix === null ? (r || v || vd ? 'h-' : null) : typeof prefix === 'string' ? prefix : prefix ? 'h-' : null,
//         key: 0,
//         react: r,
//         vue: v,
//         vdom: vd,
//         hyperscript: hyperscript(h),
//     });
// }
//
// function transform(h: any, node: any, ctx: any): any {
//     const parentSchema = ctx.schema;
//     let schema = parentSchema;
//     let name = node.tagName;
//     const attributes: any = {};
//     const nodes = [];
//     let index = -1;
//     let key;
//
//     if (parentSchema.space === 'html' && name.toLowerCase() === 'svg') {
//         schema = svg;
//         ctx.schema = schema;
//     }
//
//     for (key in node.properties) {
//         if (node.properties && own.call(node.properties, key)) {
//             addAttribute(attributes, key, node.properties[key], ctx, name);
//         }
//     }
//
//     if (ctx.vdom) {
//         if (schema.space === 'html') {
//             name = name.toUpperCase();
//         } else if (schema.space) {
//             attributes.namespace = ns[schema.space];
//         }
//     }
//
//     if (ctx.prefix) {
//         ctx.key++;
//         attributes.key = ctx.prefix + ctx.key;
//     }
//
//     if (node.children) {
//         while (++index < node.children.length) {
//             const value: any = node.children[index];
//
//             if (element(value)) {
//                 nodes.push(transform(h, value, ctx));
//             } else if (text(value)) {
//                 nodes.push(value['value']);
//             }
//         }
//     }
//
//     // Restore parent schema.
//     ctx.schema = parentSchema;
//
//     // Ensure no React warnings are triggered for void elements having children
//     // passed in.
//     return nodes.length > 0 ? h.call(node, name, attributes, nodes) : h.call(node, name, attributes);
// }
//
// /**
//  * @param {Record<string, unknown>} props
//  * @param {string} prop
//  * @param {unknown} value
//  * @param {Context} ctx
//  * @param {string} name
//  */
// // eslint-disable-next-line complexity, max-params
// function addAttribute(props: Record<string, unknown>}, prop: string, value: any, ctx: any, name: string) {
//     const info = find(ctx.schema, prop);
//     /** @type {string|undefined} */
//     let subprop;
//
//     // Ignore nullish and `NaN` values.
//     // Ignore `false` and falsey known booleans for hyperlike DSLs.
//     if (
//         value === undefined ||
//         value === null ||
//         (typeof value === 'number' && Number.isNaN(value)) ||
//         (value === false && (ctx.vue || ctx.vdom || ctx.hyperscript)) ||
//         (!value && info.boolean && (ctx.vue || ctx.vdom || ctx.hyperscript))
//     ) {
//         return;
//     }
//
//     if (Array.isArray(value)) {
//         // Accept `array`.
//         // Most props are space-separated.
//         value = info.commaSeparated ? commas(value) : spaces(value);
//     }
//
//     // Treat `true` and truthy known booleans.
//     if (info.boolean && ctx.hyperscript) {
//         value = '';
//     }
//
//     // VDOM, Vue, and React accept `style` as object.
//     if (info.property === 'style' && typeof value === 'string' && (ctx.react || ctx.vue || ctx.vdom)) {
//         value = parseStyle(value, name);
//     }
//
//     if (ctx.vue) {
//         if (info.property !== 'style') subprop = 'attrs';
//     } else if (!info.mustUseProperty) {
//         if (ctx.vdom) {
//             if (info.property !== 'style') subprop = 'attributes';
//         } else if (ctx.hyperscript) {
//             subprop = 'attrs';
//         }
//     }
//
//     if (subprop) {
//         props[subprop] = Object.assign(props[subprop] || {}, {
//             [info.attribute]: value,
//         });
//     } else if (info.space && ctx.react) {
//         props[toReact[info.property] || info.property] = value;
//     } else {
//         props[info.attribute] = value;
//     }
// }
//
// /**
//  * Check if `h` is `react.createElement`.
//  *
//  * @param {CreateElementLike} h
//  * @returns {boolean}
//  */
// function react(h: any) {
//     /** @type {unknown} */
//     const node: any = h('div', {});
//     return Boolean(node && ('_owner' in node || '_store' in node) && (node.key === undefined || node.key === null));
// }
//
// /**
//  * Check if `h` is `hyperscript`.
//  *
//  * @param {CreateElementLike} h
//  * @returns {boolean}
//  */
// function hyperscript(h: any): boolean {
//     return 'context' in h && 'cleanup' in h;
// }
//
// /**
//  * Check if `h` is `virtual-dom/h`.
//  *
//  * @param {CreateElementLike} h
//  * @returns {boolean}
//  */
// function vdom(h: any): boolean {
//     /** @type {unknown} */
//     const node = h('div', {});
//     return node.type === 'VirtualNode';
// }
//
// /**
//  * Check if `h` is Vue.
//  *
//  * @param {CreateElementLike} h
//  * @returns {boolean}
//  */
// function vue(h: any): boolean {
//     /** @type {unknown} */
//     const node = h('div', {});
//     return Boolean(node && node.context && node.context._isVue);
// }
//
// /**
//  * @param {string} value
//  * @param {string} tagName
//  * @returns {Record<string, string>}
//  */
// function parseStyle(value: any, tagName: any) {
//     /** @type {Record<string, string>} */
//     const result: any = {};
//
//     try {
//         style(value, (name, value) => {
//             if (name.slice(0, 4) === '-ms-') name = 'ms-' + name.slice(4);
//
//             result[
//                 name.replace(
//                     /-([a-z])/g,
//                     /**
//                      * @param {string} _
//                      * @param {string} $1
//                      * @returns {string}
//                      */ (_, $1) => $1.toUpperCase()
//                 )
//             ] = value;
//         });
//     } catch (error: any) {
//         error['message'] = tagName + '[style]' + error.message.slice('undefined'.length);
//         throw error;
//     }
//
//     return result;
// }
