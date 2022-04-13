import Mustache from 'mustache';
import { Props } from '../models/Props';
import { Route } from '../models/Route';

import { Router } from '../router/Router';

import UUID from '../utils/UUID';
import { pseudoClassList } from '../utils/pseudoClasses';

import { toH } from 'hast-to-hyperscript';
import h from 'hyperscript';

import { fromDom } from 'hast-util-from-dom';
import { Component } from '../models/Component';
import { minify } from 'csso';
import { ComponentRegistry } from 'lib/models/ComponentRegistry';
import { DEFAULT_OUTLET } from '../utils/DefaultOutlet';

let target: any | Function;
export default class CoreFramework {

    propsArr: Props[] = [];

    fnArr: any[] = [];

    components: ComponentRegistry;
    componentNodes: any = {};

    outletCompTree: any = {};

    router: Router;

    unRenderedcompTree: any[] = [];
    tempCompTree: any[] = [];

    encapsulatedCSSList: string[] = [];

    constructor(declarations: ComponentRegistry) {
        this.components = declarations;
    }

    init(routes: Route[]): void {
        window.addEventListener('popstate', (e: any) => {
            // router();
            // this.router.
            console.log('call Router.router() on popstate : ', e);
        });

        document.addEventListener('DOMContentLoaded', () => {
            console.log('Dom Loaded');

            // this.addListenersToElements();
            // document.body.addEventListener('change', (e: any) => {
            //     console.log('change event : ', e);
            // });

            this.createElements();

            // Router initialization
            this.router = new Router(routes);
            this.router.init();
            const [routeOutComp, outlet] = this.router.routerInit() || [
                null,
                null,
            ];
            routeOutComp ? this.createRouterOutlet(routeOutComp, outlet) : null;
        });
    }

    createElements(): void {
        console.log('Creating Elements');

        // Creating the elements for the components
        this.tempCompTree.push(
            this.registerComponent(this.components.bootStrap)
        );

        this.components.declarations.forEach((c: Component, i: number) => {
            const tree = this.registerComponent(c);
            this.tempCompTree.push(tree);
        });
        // Created -----------------------------------------------------------------

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find(
                    (r: Component) => r.selector === e.tagName
                );
                if (c) {
                    // console.log(i + " : " + c.selector);
                    // console.log(this.tempCompTree.find(v => v.tagName === c.selector));
                    // console.log("change from this : ", tree.children[i]);
                    // console.log("to this : ", this.tempCompTree.find(v => v.tagName === c.selector));

                    const data = this.tempCompTree.find(
                        (v) => v.tagName === c.selector
                    );

                    tree.children[i].children = data.children;
                    tree.children[i].data = data.data;
                    tree.children[i].properties = {
                        ...tree.children[i].properties,
                        ...data.properties,
                    };
                    tree.children[i].position = data.position;

                    recursivelyCreateDOMTree(tree.children[i]);
                }
            });
        };

        this.tempCompTree[0].children.forEach((e: any, i: number) => {
            const c = this.components.declarations.find(
                (r: Component) => r.selector === e.tagName
            );
            if (c) {
                // console.log(i + " : " + c.selector);
                // console.log(this.tempCompTree.find(v => v.tagName === c.selector));
                this.tempCompTree[0].children[i] = this.tempCompTree.find(
                    (v) => v.tagName === c.selector
                );
                recursivelyCreateDOMTree(this.tempCompTree[0].children[i]);
            }
        });
        // -------------------------------------------------------------------------------------------------

        console.warn('******************DOM Tree******************');
        console.log('DOM Tree : ', this.tempCompTree[0]);

        // Adding Encapsulated Css to the DOM head
        this.encapsulatedCSSList.forEach((css: string) => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        });

        document.querySelector('#__app').innerHTML = toH(
            h,
            this.tempCompTree[0],
            { space: 'html' }
        ).outerHTML;

        this.addListenersToElements();
    }

    addListenersToElements(c?: Component) {
        console.warn(
            '------------------Adding Listeners to Elements------------------'
        );

        // adding on click listeners
        document.body.addEventListener('click', (e: any) => {
            // console.log('Clicked in component : ', c.selector);
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(
                    e.target.href.replace(window.location.origin, '')
                );
            }
            if (e.target.attributes.length > 0) {
                e.preventDefault();
                for (let i = 0; i < e.target.attributes.length; i++) {
                    const element = e.target.attributes.item(i);
                    if (element.name.includes('_hy-click_')) {

                        const keys = Object.keys(this.componentNodes);

                        let sel = keys.map((key) => {
                            if (this.componentNodes[key].includes(element.name)) {
                                return key;
                            } else {
                                return null;
                            }
                        });
                        sel = sel.filter((v) => v);
                        const c = this.components.declarations.find(
                            (r: Component) => r.selector === sel[0]
                        );

                        const _fn = this.propsArr.find(
                            (p: Props) => p.propId === element.name
                        );
                        if (_fn) {
                            // if _fn.params contains array of params to pass in fn
                            // then pass in the params
                            // else dont pass anything
                            const parsedParams = _fn.params.map((a: string) =>
                                c.state()[a.trim()] ? c.state()[a.trim()] : null
                            )
                            if (parsedParams.length > 0) {
                                _fn.fn.apply(null, parsedParams);
                            } else {
                                _fn.fn();
                            }
                        }
                    }
                }
            }
        });

        // document.body.addEventListener('click', (e: any) => {
        //     if (e.target.matches('[data-link]')) {
        //         e.preventDefault();
        //         this.navigateTo(
        //             e.target.href.replace(window.location.origin, '')
        //         );
        //     }
        //     if (e.target.attributes.length > 0) {
        //         e.preventDefault();
        //         for (let i = 0; i < e.target.attributes.length; i++) {
        //             const element = e.target.attributes.item(i);
        //             if (element.name.includes('_hy-click_')) {
        //                 const _fn = this.propsArr.find(
        //                     (p: Props) => p.propId === element.name
        //                 );
        //                 if (_fn) {
        //                     // if _fn.params contains array of params to pass in fn
        //                     // then pass in the params
        //                     // else dont pass anything
        //                     if (_fn.params.length > 0) {
        //                         _fn.fn.apply(null, _fn.params);
        //                     } else {
        //                         _fn.fn();
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // });

        // if we need to get object value from string like event.target.value
        // we need to use this function
        const deep_value = (o: any, s: string): any => {
            s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
            s = s.replace(/^\./, ''); // strip a leading dot
            var a = s.split('.');
            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];
                if (k in o) {
                    o = o[k];
                } else {
                    return;
                }
            }
            return o;
        };

        this.propsArr.forEach((p: Props) => {
            if (p.type === 'onchange') {
                const element = document.querySelector('[' + p.propId + ']');
                if (element) {
                    element.addEventListener('keyup', (e: any) => {
                        if (p.params.length > 0) {
                            const paramsValArr = p.params.map(
                                (param: string) => {
                                    param =
                                        typeof param === 'string'
                                            ? param.trim()
                                            : param;
                                    if (
                                        typeof param === 'string' &&
                                        param === '$event'
                                    ) {
                                        param = e;
                                    } else if (
                                        typeof param === 'string' &&
                                        param.includes('$event')
                                    ) {
                                        param = deep_value(
                                            e,
                                            param.replace('$event.', '')
                                        );
                                    }
                                    return param;
                                }
                            );
                            if (p.fn) {
                                if (
                                    paramsValArr.length > 0 &&
                                    paramsValArr[0] !== undefined
                                ) {
                                    p.fn.apply(null, paramsValArr);
                                } else {
                                    p.fn();
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    createRouterOutlet(rootComp: Component, outlet?: string): any {
        this.outletCompTree = this.unRenderedcompTree.find(
            (v) => v.tagName === rootComp.selector
        );

        // idk but this might be needed in future for the children routes to work
        // const outletComp = this.outletCompTree.children.find((c: any) => c.tagName === outlet || c.tagName === DEFAULT_OUTLET);

        // console.log('Outlet Comp : ', this.outletCompTree);

        const rendered = Mustache.render(
            toH(h, this.outletCompTree, { space: 'html' }).outerHTML,
            rootComp.state()
        );

        // console.log('Rendered : ', rendered);

        this.outletCompTree = this.createUnRenderedTreeNode(
            rendered,
            rootComp.selector
        );

        // console.log("rendered html : ", rendered);

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find(
                    (r: Component) => r.selector === e.tagName
                );
                if (c) {
                    const data = this.tempCompTree.find(
                        (v) => v.tagName === c.selector
                    );

                    tree.children[i].children = data.children;
                    tree.children[i].data = data.data;
                    tree.children[i].properties = {
                        ...tree.children[i].properties,
                        ...data.properties,
                    };
                    tree.children[i].position = data.position;

                    recursivelyCreateDOMTree(tree.children[i]);
                }
            });
        };

        this.outletCompTree.children.forEach((e: any, i: number) => {
            const c = this.components.declarations.find(
                (r: Component) => r.selector === e.tagName
            );
            if (c) {
                this.outletCompTree.children[i] = this.tempCompTree.find(
                    (v) => v.tagName === c.selector
                );
                recursivelyCreateDOMTree(this.outletCompTree.children[i]);
            }
        });

        // console.log('Outlet DOM Tree : ', this.outletCompTree);
        document
            .querySelectorAll(outlet ? outlet : DEFAULT_OUTLET.DEFAULT)
            .forEach((routerOut: any) => {
                routerOut.innerHTML = toH(h, this.outletCompTree, {
                    space: 'html',
                }).outerHTML;
            });
    }

    registerComponent(r: Component): any {
        const data: any = r.state() ? r.state() : {};
        let css: string = r.style()
            ? minify(r.style(), { restructure: false, comments: false }).css
            : null;

        let styleSheet: { class: any; id: any; tag: any } = {
            class: {},
            id: {},
            tag: {},
        };

        console.warn('-----------' + r.selector + '-----------');

        // making html
        // const html: string = Mustache.render(r.view(), data);
        const unRenderedHTML: string = r.view();

        // const tree = this.createTreeNode(html, r.selector);
        const tree = this.createTreeNode(unRenderedHTML, r.selector);

        // Adding onclick event to the elements
        const recursivelyAddEventBiniding = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const props = e.properties;
                for (const key in props) {
                    if (Object.prototype.hasOwnProperty.call(props, key)) {
                        if (
                            props.hasOwnProperty('(onclick)') &&
                            key === '(onclick)'
                        ) {
                            const element = props[key];
                            const functionName = element.substring(
                                1,
                                element.indexOf('(')
                            );
                            const args = element.substring(
                                element.indexOf('(') + 1,
                                element.indexOf(')')
                            );
                            const argsArray = args.split(',');
                            const clickId = '_hy-click_' + new UUID().generate();
                            this.componentNodes[r.selector] ? this.componentNodes[r.selector].push(clickId) : this.componentNodes[r.selector] = [clickId];
                            const newProp: Props = {
                                type: 'onclick',
                                name: functionName,
                                propId: clickId,
                                valueName: functionName,
                                // params: argsArray.map((a: string) =>
                                //     r.state()[a.trim()] ? r.state()[a.trim()] : null
                                // ),
                                params: argsArray,
                                fn: r.state()[functionName],
                            };

                            this.propsArr.push(newProp);

                            delete e.properties[key];
                            e.properties[newProp.propId as string] = '';

                        }
                        if (
                            props.hasOwnProperty('(onchange)') &&
                            key === '(onchange)'
                        ) {
                            const element = props[key];
                            const functionName = element.substring(
                                1,
                                element.indexOf('(')
                            );
                            const args = element.substring(
                                element.indexOf('(') + 1,
                                element.indexOf(')')
                            );
                            const argsArray = args.split(',');

                            const newProp: Props = {
                                type: 'onchange',
                                name: functionName,
                                propId: '_hy-change_' + new UUID().generate(),
                                valueName: functionName,
                                params: argsArray.map((a: string) =>
                                    r.state()[a.trim()] ? r.state()[a.trim()] : a
                                ),
                                fn: r.state()[functionName],
                            };

                            this.propsArr.push(newProp);

                            delete e.properties[key];
                            e.properties[newProp.propId as string] = '';
                        }
                    }
                }
                if (e.children && e.children.length > 0) {
                    recursivelyAddEventBiniding(e);
                }
            });
        };

        recursivelyAddEventBiniding(tree);

        const recursivelyParseCSS = (child: any[]) => {
            child.forEach((e2: any) => {
                if (e2.type !== 'text' && e2.type !== 'comment') {
                    if (e2.properties.hasOwnProperty('className')) {
                        const ele2: string[] = e2.properties.className;

                        ele2.forEach((s: string) => {
                            if (s && css) {
                                // chacking if the class is there in components css
                                // and if class is added on multiple elements or not
                                if (css.includes('.' + s)) {
                                    const id =
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']';
                                    styleSheet.class = {
                                        ...styleSheet.class,
                                        [s]: styleSheet.class[s]
                                            ? [...styleSheet.class[s], id]
                                            : [id],
                                    };
                                }
                            }
                        });
                    }
                    if (css && e2.properties.hasOwnProperty('id')) {
                        const eleId: string = e2.properties.id;
                        if (css.includes('#' + eleId)) {
                            styleSheet.id = {
                                ...styleSheet.id,
                                [eleId]: styleSheet.id[eleId]
                                    ? [
                                        ...styleSheet.id[eleId],
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ]
                                    : [
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ],
                            };
                        }
                    }
                    if (css && css.includes('}' + e2.tagName + '{')) {
                        if (
                            !this.components.declarations.find(
                                (r: Component) => r.selector === e2.tagName
                            )
                        ) {
                            styleSheet.tag = {
                                ...styleSheet.tag,
                                [e2.tagName]: styleSheet.tag[e2.tagName]
                                    ? [
                                        ...styleSheet.tag[e2.tagName],
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ]
                                    : [
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ],
                            };
                        }
                    }
                    // and if the element tag is the first element of the css
                    // eg, if the css is nav{}.class{}, then the first element is nav
                    if (
                        css &&
                        css.includes(e2.tagName + '{') &&
                        css.indexOf(e2.tagName + '{') === 0
                    ) {
                        if (
                            !this.components.declarations.find(
                                (r: Component) => r.selector === e2.tagName
                            )
                        ) {
                            styleSheet.tag = {
                                ...styleSheet.tag,
                                [e2.tagName]: styleSheet.tag[e2.tagName]
                                    ? [
                                        ...styleSheet.tag[e2.tagName],
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ]
                                    : [
                                        '[' +
                                        Object.keys(e2.properties).find(
                                            (r: string) =>
                                                r.includes('_hy-ghost_')
                                        ) +
                                        ']',
                                    ],
                            };
                        }
                    }

                    if (
                        e2.children.length > 0 &&
                        !this.components.declarations.find(
                            (r: Component) => r.selector === e2.tagName
                        )
                    ) {
                        recursivelyParseCSS(e2.children);
                    }
                }
            });
        };

        recursivelyParseCSS(tree.children);

        // from stylesheet object adding ecapsulated classes to css
        Object.keys(styleSheet.class).forEach((key: string) => {
            css = css.replaceAll(
                '.' + key + '{',
                '.' + key + styleSheet.class[key].join(',') + '{'
            );
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(
                    new RegExp('.' + key + p + '{', 'g'),
                    '.' + key + styleSheet.class[key].join(p + ',') + p + '{'
                );
            });
        });

        // from stylesheet object adding ecapsulated ids to css
        Object.keys(styleSheet.id).forEach((key: string) => {
            css = css.replaceAll(
                '#' + key + '{',
                '#' + key + styleSheet.id[key].join(',') + '{'
            );
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(
                    new RegExp('#' + key + p + '{', 'g'),
                    '#' + key + styleSheet.id[key].join(p + ',') + p + '{'
                );
            });
        });

        // from stylesheet object adding ecapsulated element style to css
        Object.keys(styleSheet.tag).forEach((key: string) => {
            css = css.replaceAll(
                key + '{',
                key + styleSheet.tag[key].join(',') + '{'
            );
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(
                    new RegExp(key + p + '{', 'g'),
                    key + styleSheet.tag[key].join(p + ',') + p + '{'
                );
            });
        });

        // console.log('doc tree : ', tree);

        css ? this.encapsulatedCSSList.push(css) : null;

        const doc = toH(h, tree).outerHTML;

        this.setState(data, r, doc);

        // adding comp tree without rendering mustache tags
        this.unRenderedcompTree.push(tree);

        // adding comp tree with rendering mustache tags

        const renderedTree = this.createUnRenderedTreeNode(
            Mustache.render(doc, data),
            r.selector
        );

        console.log('rendered tree : ', renderedTree);

        // customElements.get(r.selector) || customElements.define(r.selector, class extends CustomElementClass {
        //     constructor() {
        //         var s: any = super();
        //         s.innerHTML = Mustache.render(doc, r.state());
        //         // s.innerHTML = Mustache.render(r.view().view(), r.view().state());
        //     }
        // });

        // return tree;
        return renderedTree;
    }

    //     insertAt(str: string, index: number, value: string) {
    //         return str.slice(0, index) + value + str.slice(index);
    //     }
    //
    //     idxOfAllOccurrences(
    //         searchStr: string,
    //         str: string,
    //         caseSensitive?: boolean
    //     ): number[] {
    //         var searchStrLen = searchStr.length;
    //         if (searchStrLen == 0) {
    //             return [];
    //         }
    //         var startIndex = 0,
    //             index,
    //             indices = [];
    //         if (!caseSensitive) {
    //             str = str.toLowerCase();
    //             searchStr = searchStr.toLowerCase();
    //         }
    //         while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //             indices.push(index);
    //             startIndex = index + searchStrLen;
    //         }
    //         return indices;
    //     }

    createTreeNode(html: string, selector: string): any {
        const ele = document.createElement(selector);
        ele.innerHTML = html;
        const hast: any = fromDom(ele);

        const nodeId: string = '_hy-node_' + new UUID().generate();
        // adding _hy-node_ Id to every node or Component
        hast.properties[nodeId] = '';

        // adding _hy_ghost Id to every element in the node for css encapsulation
        const addHyNodeIdToEveryElement = (tree: any) => {
            tree.children.forEach((e: any) => {
                if (e.type === 'element') {
                    const ghostId = '_hy-ghost_' + new UUID().generate();
                    this.componentNodes[selector] ? this.componentNodes[selector].push(ghostId) : (this.componentNodes[selector] = [ghostId]);
                    e.properties[ghostId] = '';
                    if (e.children.length > 0) {
                        addHyNodeIdToEveryElement(e);
                    }
                }
            });
        };
        addHyNodeIdToEveryElement(hast);
        // ---------------------------------------------------------------------

        const tree = {
            type: hast.type,
            tagName: hast.tagName,
            properties: hast.properties,
            children: hast.children,
            data: hast.data,
            position: hast.position,
        };
        return tree;
    }

    createUnRenderedTreeNode(html: string, selector: string): any {
        const ele = document.createElement(selector);
        ele.innerHTML = html;
        const hast: any = fromDom(ele.getElementsByTagName(selector)[0]);

        const tree = {
            type: hast.type,
            tagName: hast.tagName,
            properties: hast.properties,
            children: hast.children,
            data: hast.data,
            position: hast.position,
        };
        return tree;
    }

    watcher(functn: any, fnName: string): void {
        target = functn;

        // calls the function for the first time but we dont have to call the function we just
        // need to store the function and call it whenever needed

        // target();

        this.fnArr.push({ [fnName]: functn });
        target = null;
    }

    setState(data: any, r: Component, html: string): void {
        Object.keys(data).forEach((key: any) => {
            let internalValue: any = data[key];

            if (typeof internalValue === 'function') {
                this.watcher(internalValue, key);
            } else {
                const dep = new Dep();

                const createUnRenderedTreeNode = this.createUnRenderedTreeNode;
                const components = this.components;
                const unRenderedcompTree = this.unRenderedcompTree;

                Object.defineProperty(data, key, {
                    get() {
                        // console.log('getting value : ', internalValue);
                        dep.depend();
                        return internalValue;
                    },
                    set(newValue) {
                        // console.log('setting value of ' + key + ': ', newValue);
                        internalValue = newValue;

                        // renderUpdatedComponent(c, r.selector, data);

                        this.outletCompTree = unRenderedcompTree.find(
                            (v: any) => v.tagName === r.selector
                        );

                        const rendered = Mustache.render(
                            toH(h, this.outletCompTree, { space: 'html' })
                                .outerHTML,
                            data
                        );

                        // console.log('Rendered with updated state : ', rendered);

                        this.outletCompTree = createUnRenderedTreeNode(
                            rendered,
                            r.selector
                        );

                        // console.log("rendered html : ", rendered);

                        // Recursively Create DOM Tree for all the components
                        const recursivelyCreateDOMTree = (tree: any) => {
                            tree.children.forEach((e: any, i: number) => {
                                const c = components.declarations.find(
                                    (r: Component) => r.selector === e.tagName
                                );
                                if (c) {
                                    const data = this.tempCompTree.find(
                                        (v: any) => v.tagName === c.selector
                                    );

                                    tree.children[i].children = data.children;
                                    tree.children[i].data = data.data;
                                    tree.children[i].properties = {
                                        ...tree.children[i].properties,
                                        ...data.properties,
                                    };
                                    tree.children[i].position = data.position;

                                    recursivelyCreateDOMTree(tree.children[i]);
                                }
                            });
                        };

                        this.outletCompTree.children.forEach(
                            (e: any, i: number) => {
                                const c = components.declarations.find(
                                    (r: Component) => r.selector === e.tagName
                                );
                                if (c) {
                                    this.outletCompTree.children[i] =
                                        this.tempCompTree.find(
                                            (v: any) => v.tagName === c.selector
                                        );
                                    recursivelyCreateDOMTree(
                                        this.outletCompTree.children[i]
                                    );
                                }
                            }
                        );

                        const newNodes: any[] = [];
                        const oldNodes: any[] = [];

                        const checNewNodes = (node: any) => {
                            node.querySelectorAll('*').forEach(
                                (n: any, idx: number) => {
                                    // console.log('node : ', n);
                                    newNodes.push(n);
                                }
                            );
                        };
                        const checOldNodes = (node: any) => {

                            node.querySelectorAll('*').forEach(
                                (n: any, idx: number) => {
                                    // console.log('node : ', n);
                                    oldNodes.push(n);
                                }
                            );
                        };

                        // console.log('Outlet Comp Tree : ', this.outletCompTree);

                        // console.log('To Append : ', toH(h, this.outletCompTree, { space: 'html', }));

                        checNewNodes(toH(h, this.outletCompTree, { space: 'html', }));

                        document
                            .querySelectorAll(r.selector)
                            .forEach((compNode: any) => {
                                checOldNodes(compNode);
                            });

                        // console.log('oldNodes : ', oldNodes);
                        // console.log('newNodes : ', newNodes);

                        if (oldNodes.length === newNodes.length) {
                            for (let i = 0; i < oldNodes.length; i++) {
                                if (!oldNodes[i].isEqualNode(newNodes[i])) {
                                    console.log('node is not equal : ', oldNodes[i], newNodes[i]);
                                    oldNodes[i].parentNode.replaceChild(newNodes[i], oldNodes[i]);
                                }
                            }
                        }

                        // document
                        //     .querySelectorAll(r.selector)
                        //     .forEach((componentOut: any) => {
                        //         console.log(
                        //             'component Outlet : ',
                        //             componentOut
                        //         );
                        //         // componentOut.innerHTML = toH(
                        //         //     h,
                        //         //     this.outletCompTree,
                        //         //     {
                        //         //         space: 'html',
                        //         //     }
                        //         // ).innerHTML;
                        //     });

                        // updateTemplate(r.selector, html, data);

                        dep.notify();
                    },
                });
            }
        });
    }

    renderUpdatedComponent(
        rootComp: Component,
        outlet: string,
        updatedState: any
    ) {
        this.outletCompTree = this.unRenderedcompTree.find(
            (v) => v.tagName === rootComp.selector
        );

        // idk but this might be needed in future for the children routes to work
        // const outletComp = this.outletCompTree.children.find((c: any) => c.tagName === outlet || c.tagName === DEFAULT_OUTLET);

        // console.log('Outlet Comp : ', this.outletCompTree);

        const rendered = Mustache.render(
            toH(h, this.outletCompTree, { space: 'html' }).outerHTML,
            updatedState
        );

        console.log('Rendered with updated state : ', rendered);

        this.outletCompTree = this.createUnRenderedTreeNode(
            rendered,
            rootComp.selector
        );

        // console.log("rendered html : ", rendered);

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find(
                    (r: Component) => r.selector === e.tagName
                );
                if (c) {
                    const data = this.tempCompTree.find(
                        (v) => v.tagName === c.selector
                    );

                    tree.children[i].children = data.children;
                    tree.children[i].data = data.data;
                    tree.children[i].properties = {
                        ...tree.children[i].properties,
                        ...data.properties,
                    };
                    tree.children[i].position = data.position;

                    recursivelyCreateDOMTree(tree.children[i]);
                }
            });
        };

        this.outletCompTree.children.forEach((e: any, i: number) => {
            const c = this.components.declarations.find(
                (r: Component) => r.selector === e.tagName
            );
            if (c) {
                this.outletCompTree.children[i] = this.tempCompTree.find(
                    (v) => v.tagName === c.selector
                );
                recursivelyCreateDOMTree(this.outletCompTree.children[i]);
            }
        });

        console.log('Outlet DOM Tree : ', this.outletCompTree);
        document.querySelectorAll(outlet).forEach((componentOut: any) => {
            console.log('Router Outlet : ', componentOut);
            componentOut.innerHTML = toH(h, this.outletCompTree, {
                space: 'html',
            }).outerHTML;
        });
    }

    // updateTemplate(name: string, html: string, data: any): void {
    //     const c: Component = this.components.declarations.find(
    //         (c: any) => c.selector === name
    //     );
    //     this.renderUpdatedComponent(c, name, data);
    //     // if (!customElements.get(name)) {
    //     //     console.warn(`Component Error : ${name} does not exist`);
    //     // } else {
    //     //
    //     // }
    // }

    navigateTo(url: string): void {
        const [routeOutComp, outlet] = this.router.navigateByPath(url) || [
            null,
            null,
        ];
        if (routeOutComp) {
            history.pushState(null, null, url);
            this.createRouterOutlet(routeOutComp, outlet);
        }
    }
}

class Dep {
    subscribers: any[] = [];
    constructor() { }

    depend(): void {
        /**
         * Will be called after every value getter
         */
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target);
        }
    }

    notify(): void {
        /**
         * Will be called after every value setter
         */
        this.subscribers.forEach((sub) => sub());
    }
}
