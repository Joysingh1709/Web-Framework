'use-strict';

import Mustache from 'mustache';
import { Props } from '../models/Props';
import { Route } from '../models/Route';

import { Router } from '../router/Router';

import UUID from '../utils/UUID';
import { pseudoClassList } from '../utils/pseudoClasses';

import { toH } from 'hast-to-hyperscript';
import h from 'hyperscript';
// import { fromDom } from 'hast-util-from-dom';

// import { toH } from '../hast/HtoH';
// import h from '../hast/Tree';
import { fromDom } from '../hast/fromDom';

import { DiffDOM, nodeToObj, stringToObj } from 'diff-dom';

import createElement from '../v-dom/element';
import diff from '../v-dom/diff';
import patch from '../v-dom/patch';

import { Component } from '../models/Component';
import { minify } from 'csso';
import { ComponentRegistry } from 'lib/models/ComponentRegistry';
import { DEFAULT_OUTLET } from '../utils/DefaultOutlet';
// import CustomEvent from './CustomEvent';

let target: any | Function;
let virtualDOM: any = {};
let rootNode!: any;
export default class CoreFramework {
    propsArr: Props[] = [];

    fnArr: any[] = [];

    components: { declarations: Component[]; bootStrap: Component };
    componentNodes: any = {};

    outletCompTree: any = {};

    router: Router;

    unRenderedcompTree: any[] = [];
    tempCompTree: any[] = [];

    encapsulatedCSSList: string[] = [];
    componentDeclarations: ComponentRegistry;
    propertyBindings: any = [];

    constructor(declarations: ComponentRegistry) {
        this.componentDeclarations = declarations;

        this.componentDeclarations.declarations.forEach((c: Function) => {
            if (c.length > 0) {
                console.log('Component : ', c);
            }
        });

        this.components = {
            declarations: this.componentDeclarations.declarations.map((c: Function) => c()),
            bootStrap: this.componentDeclarations.bootStrap(),
        };
    }

    init(routes: Route[]): void {
        window.addEventListener('popstate', (e: any) => {
            // router();
            console.log('call Router.router() on popstate : ', e.target.location.href);
            console.log('on global window object : ', window.location.href);
            this.navigateTo(e.target.location.href.replace(window.location.origin, ''));
        });

        document.addEventListener('DOMContentLoaded', () => {
            console.log('Dom Loaded');

            this.createElements();

            // Router initialization
            this.router = new Router(routes);
            this.router.init();
            const [routeOutComp, outlet] = this.router.routerInit() || [null, null];
            routeOutComp ? this.createRouterOutlet(routeOutComp, outlet) : null;
        });
    }

    // makeNode(node: any): any {
    //     node = this.changeClassNameToClass(node);
    //     console.log('makeNode : ', node);
    //     return createElement(node.tagName, node.properties, this.getChildren(node));
    // }

    // getChildren(node: any): any {
    //     node = this.changeClassNameToClass(node);
    //     console.log('makeNode : ', node);
    //     return node.children.map((child: any) => {
    //         if (child.type === 'text') {
    //             return child.value;
    //         }
    //         if (child.type === 'element') {
    //             return createElement(child.tagName, child.properties, this.getChildren(child));
    //         }
    //     });
    // }

    // changeClassNameToClass(node: any): any {
    //     if (node.properties.hasOwnProperty('className')) {
    //         const classList = node.properties.className;
    //         const className = classList.join(' ');
    //         node.properties.class = className;
    //         delete node.properties.className;
    //     }
    //     return node;
    // }

    //     createVirtualDomTree(): any {
    //         let vDOM = this.tempCompTree[0];
    //         vDOM = this.makeNode(vDOM);
    //
    //         return vDOM;
    //     }

    createElements(): void {
        console.log('Creating Elements');

        // Creating the elements for the components
        this.tempCompTree.push(this.registerComponent(this.components.bootStrap));

        this.components.declarations.forEach((c: Component, i: number) => {
            const tree = this.registerComponent(c);
            this.tempCompTree.push(tree);
        });
        // Created -----------------------------------------------------------------

        // creating cross component property bindings e.g. <app-child [childProp]="{message}">
        this.propertyBindings.forEach((p: any) => {
            console.log('propertyBindings : ', p);

            const parent = p.parent;
            const target = p.target;
            const targetProp = p.targetProp;
            const targetPropValue = p.targetPropValue;

            const _p = this.components.declarations.find((c: Component) => c.selector === parent);
            const _c = this.components.declarations.find((c: Component) => c.selector === target);

            if (_p && _c) {
                _c.state()[targetProp] = targetPropValue;
            }
        });

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
                if (c) {
                    // console.log(i + " : " + c.selector);
                    // console.log(this.tempCompTree.find(v => v.tagName === c.selector));
                    // console.log("change from this : ", tree.children[i]);
                    // console.log("to this : ", this.tempCompTree.find(v => v.tagName === c.selector));

                    const data = this.tempCompTree.find(v => v.tagName === c.selector);

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
            const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
            if (c) {
                // console.log(i + " : " + c.selector);
                // console.log(this.tempCompTree.find(v => v.tagName === c.selector));
                this.tempCompTree[0].children[i] = this.tempCompTree.find(v => v.tagName === c.selector);
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

        /**
         * code updated to virtual dom with the help of virtual-dom algorithms
         */
        const _n = toH(h, this.tempCompTree[0], { space: 'html' });

        const vDOM = this.makeVirtualDOM(_n);

        // current virtual dom tree
        virtualDOM = vDOM;
        rootNode = vDOM.render();
        console.log('Virtual DOM : ', virtualDOM);
        console.log('Root Node : ', rootNode);
        document.querySelector('#__app').appendChild(rootNode);

        // document.querySelector('#__app').innerHTML = toH(h, this.tempCompTree[0], { space: 'html' }).outerHTML;

        this.addListenersToElements();
    }

    makeVirtualDOM(node: any): any {
        let vDom = {};
        node.querySelectorAll('*').forEach((ele: any) => {
            const attrNames = Object.keys(ele.attributes);
            const attrList = attrNames.map((a: string) => {
                const attr = ele.attributes[a];
                return {
                    [attr.name]: attr.value,
                };
            });
            let attrObj = {};
            attrList.forEach((a: any) => {
                attrObj = { ...attrObj, ...a };
            });
            vDom = createElement(node.tagName.toLowerCase(), attrObj, this.getChildrenFromHtmlNode(node));
        });
        return vDom;
    }

    getChildrenFromHtmlNode(node: any): any {
        let children = Array.from(node.childNodes);
        return children.map((child: any) => {
            if (child.nodeType === Node.TEXT_NODE) {
                return child.textContent;
            } else if (child.nodeType === Node.COMMENT_NODE) {
                return child.textContent;
            } else {
                const attrNames = Object.keys(child.attributes);
                const attrList = attrNames.map((a: string) => {
                    const attr = child.attributes[a];
                    return {
                        [attr.name]: attr.value,
                    };
                });
                let attrObj = {};
                attrList.forEach((a: any) => {
                    attrObj = { ...attrObj, ...a };
                });
                return createElement(child.tagName.toLowerCase(), attrObj, this.getChildrenFromHtmlNode(child));
            }
        });
    }

    addListenersToElements(c?: Component) {
        console.warn('------------------Adding Listeners to Elements------------------');

        // adding on click listeners
        document.body.addEventListener('click', (e: any) => {
            // console.log('Clicked in component : ', c.selector);
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.href.replace(window.location.origin, ''));
            }
            if (e.target.attributes.length > 0) {
                e.preventDefault();
                for (let i = 0; i < e.target.attributes.length; i++) {
                    const element = e.target.attributes.item(i);
                    if (element.name.includes('_hy-click_')) {
                        const keys = Object.keys(this.componentNodes);

                        let sel = keys.map(key => {
                            if (this.componentNodes[key].includes(element.name)) {
                                return key;
                            } else {
                                return null;
                            }
                        });
                        sel = sel.filter(v => v);
                        const c = this.components.declarations.find((r: Component) => r.selector === sel[0]);

                        const _fn = this.propsArr.find((p: Props) => p.propId === element.name);
                        if (_fn) {
                            // if _fn.params contains array of params to pass in fn
                            // then pass in the params
                            // else dont pass anything
                            const parsedParams = _fn.params.map((a: string) => (c.state()[a.trim()] ? c.state()[a.trim()] : null));
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

        console.log('prop arr : ', this.propsArr);

        this.propsArr.forEach((p: Props) => {
            if (p.type === 'onchange') {
                const element = document.querySelector('[' + p.propId + ']');
                if (element) {
                    element.addEventListener('change', (e: any) => {
                        if (p.params.length > 0) {
                            const paramsValArr = p.params.map((param: string) => {
                                param = typeof param === 'string' ? param.trim() : param;
                                if (typeof param === 'string' && param === '$event') {
                                    param = e;
                                } else if (typeof param === 'string' && param.includes('$event')) {
                                    param = deep_value(e, param.replace('$event.', ''));
                                }
                                return param;
                            });
                            if (p.fn) {
                                if (paramsValArr.length > 0 && paramsValArr[0] !== undefined) {
                                    p.fn.apply(null, paramsValArr);
                                } else {
                                    p.fn();
                                }
                            }
                        }
                    });
                }
            }
            if (p.type === 'bind') {
                const element = document.querySelector('[' + p.propId + ']');
                if (element) {
                    for (let i = 0; i < element.attributes.length; i++) {
                        const at = element.attributes.item(i);
                        if (at.name.includes('_hy-model_')) {
                            element.addEventListener('keyup', (e: any) => {
                                if (p.fn !== undefined) {
                                    const keys = Object.keys(this.componentNodes);

                                    let sel = keys.map(key => {
                                        if (this.componentNodes[key].includes(at.name)) {
                                            return key;
                                        } else {
                                            return null;
                                        }
                                    });
                                    sel = sel.filter(v => v);
                                    const c = this.components.declarations.find((r: Component) => r.selector === sel[0]);
                                    if (typeof c.state()[p.valueName] !== 'function') {
                                        // setting new value to the binded property
                                        c.state()[p.valueName] = e.target.value;
                                    } else throw new Error('Cannot bind function');
                                }
                            });
                        }
                    }
                }
            }
        });
    }

    createRouterOutlet(rootComp: Component, outlet?: string): any {
        this.outletCompTree = this.unRenderedcompTree.find(v => v.tagName === rootComp.selector);

        // idk but this might be needed in future for the children routes to work
        // const outletComp = this.outletCompTree.children.find((c: any) => c.tagName === outlet || c.tagName === DEFAULT_OUTLET);

        // console.log('Outlet Comp : ', this.outletCompTree);

        const rendered = Mustache.render(toH(h, this.outletCompTree, { space: 'html' }).outerHTML, rootComp.state());

        // console.log('Rendered : ', rendered);

        this.outletCompTree = this.createUnRenderedTreeNode(rendered, rootComp.selector);

        // console.log("rendered html : ", rendered);

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
                if (c) {
                    const data = this.tempCompTree.find(v => v.tagName === c.selector);

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
            const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
            if (c) {
                this.outletCompTree.children[i] = this.tempCompTree.find(v => v.tagName === c.selector);
                recursivelyCreateDOMTree(this.outletCompTree.children[i]);
            }
        });

        // console.log('Outlet DOM Tree : ', this.outletCompTree);
        document.querySelectorAll(outlet ? outlet : DEFAULT_OUTLET.DEFAULT).forEach((routerOut: any) => {
            routerOut.innerHTML = toH(h, this.outletCompTree, {
                space: 'html',
            }).outerHTML;
        });
    }

    registerComponent(r: Component): any {
        let css: string = r.style() ? minify(r.style(), { restructure: false, comments: false }).css : null;

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
                        // on click event binding
                        if (props.hasOwnProperty('(onclick)') && key === '(onclick)') {
                            const element = props[key];
                            const functionName = element.substring(1, element.indexOf('('));
                            const args = element.substring(element.indexOf('(') + 1, element.indexOf(')'));
                            const argsArray = args.split(',');
                            const clickId = '_hy-click_' + new UUID().generate();
                            this.componentNodes[r.selector] ? this.componentNodes[r.selector].push(clickId) : (this.componentNodes[r.selector] = [clickId]);
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

                        // two way property binding with event name : 'bind'
                        if (props.hasOwnProperty('(bind)') && key === '(bind)') {
                            const element = props[key];

                            // remove the property name from {} brackets
                            const propertyName = element.substring(element.indexOf('{') + 1, element.indexOf('}')).trim();

                            const args = element.substring(element.indexOf('(') + 1, element.indexOf(')'));

                            if (r.state()[propertyName] !== undefined) {
                                console.log('Binding propertyName : ', propertyName);
                                const argsArray = args.split(',');
                                const modelId = '_hy-model_' + new UUID().generate();
                                this.componentNodes[r.selector] ? this.componentNodes[r.selector].push(modelId) : (this.componentNodes[r.selector] = [modelId]);
                                const newProp: Props = {
                                    type: 'bind',
                                    name: propertyName,
                                    propId: modelId,
                                    valueName: propertyName,
                                    params: argsArray.map((a: string) => (r.state()[a.trim()] ? r.state()[a.trim()] : a)),
                                    fn: r.state()[propertyName],
                                };

                                this.propsArr.push(newProp);

                                delete e.properties[key];
                                e.properties[newProp.propId as string] = '';
                            } else {
                                throw new Error('Cannot find property : ' + propertyName);
                            }
                        }

                        // on change event binding
                        if (props.hasOwnProperty('(onchange)') && key === '(onchange)') {
                            const element = props[key];
                            const functionName = element.substring(1, element.indexOf('('));
                            const args = element.substring(element.indexOf('(') + 1, element.indexOf(')'));
                            const argsArray = args.split(',');

                            const newProp: Props = {
                                type: 'onchange',
                                name: functionName,
                                propId: '_hy-change_' + new UUID().generate(),
                                valueName: functionName,
                                params: argsArray.map((a: string) => (r.state()[a.trim()] ? r.state()[a.trim()] : a)),
                                fn: r.state()[functionName],
                            };

                            this.propsArr.push(newProp);

                            delete e.properties[key];
                            e.properties[newProp.propId as string] = '';
                        }

                        // for (emit)="{method()}" we can pass the method name as a string from the target compoenent
                        // and the method will be called when the event is emitted
                        // dont need any CustomEvent instance to emit the event
                        // just get the target component and call the method and pass the value into it
                        // set the change detection as the state changes the target component will also get updated
                        if (props.hasOwnProperty('(emit)') && key === '(emit)') {
                            const element = props[key];
                            const functionName = element.substring(element.indexOf('{') + 1, element.indexOf('}')).trim();
                            const args = element.substring(element.indexOf('(') + 1, element.indexOf(')'));
                            const argsArray = args.split(',');

                            const newProp: Props = {
                                type: 'emit',
                                name: functionName,
                                propId: '_hy-emit_' + new UUID().generate(),
                                valueName: functionName,
                                params: argsArray.map((a: string) => (r.state()[a.trim()] ? r.state()[a.trim()] : a)),
                                fn: r.state()[functionName],
                            };

                            this.propsArr.push(newProp);

                            delete e.properties[key];
                            e.properties[newProp.propId as string] = '';
                        }

                        // custom event binding like [eventName]="functionName"
                        if (key.match(/\[.*\]/g)) {
                            // console.log('key : ', key.match(/\[.*\]/g));
                            let eventName = key.match(/\[.*\]/g)[0].replace(/\[|\]/g, '');

                            console.log('event name : ', eventName);

                            console.log('event passed to : ', e.tagName);

                            const value = props[key].substring(props[key].indexOf('{') + 1, props[key].indexOf('}')).trim();
                            console.log('event value : ', r.state()[value]);

                            console.log('---------------------------------------------------------------------------');

                            const element = props[key];
                            const functionName = eventName;
                            const args = element.substring(element.indexOf('(') + 1, element.indexOf(')'));
                            const argsArray = args.split(',');

                            const propId = '_hy-prop_' + new UUID().generate();

                            // binding the properties
                            const cFn = this.components.declarations.filter((c: Component) => c.selector === e.tagName);
                            Object.keys(cFn[0].state()).forEach((key: string) => {
                                if (key.toLowerCase() === eventName.toLowerCase()) {
                                    // cFn[0].state()[key] = r.state()[value];
                                    this.propertyBindings.push({
                                        parent: r.selector,
                                        propName: value,
                                        target: e.tagName,
                                        bindingId: propId,
                                        targetProp: key,
                                        targetPropValue: r.state()[value],
                                        targetPropType: typeof r.state()[value],
                                        targetPropParams: argsArray.map((a: string) => (r.state()[a.trim()] ? r.state()[a.trim()] : a)),
                                        targetPropFn: r.state()[functionName],
                                    });
                                }
                            });
                            //                             console.log('child : ', cFn[0].state());
                            //
                            //                             console.log('parent : ', this.components.declarations[3].state());
                            //---------------------------------------------------------------------------------

                            const newProp: Props = {
                                type: 'custom Event',
                                name: functionName,
                                propId: propId,
                                valueName: functionName,
                                params: argsArray.map((a: string) => (r.state()[a.trim()] ? r.state()[a.trim()] : a)),
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
                                    const id = '[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']';
                                    styleSheet.class = {
                                        ...styleSheet.class,
                                        [s]: styleSheet.class[s] ? [...styleSheet.class[s], id] : [id],
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
                                    ? [...styleSheet.id[eleId], '[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']']
                                    : ['[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']'],
                            };
                        }
                    }
                    if (css && css.includes('}' + e2.tagName + '{')) {
                        if (!this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                            styleSheet.tag = {
                                ...styleSheet.tag,
                                [e2.tagName]: styleSheet.tag[e2.tagName]
                                    ? [...styleSheet.tag[e2.tagName], '[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']']
                                    : ['[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']'],
                            };
                        }
                    }
                    // and if the element tag is the first element of the css
                    // eg, if the css is nav{}.class{}, then the first element is nav
                    if (css && css.includes(e2.tagName + '{') && css.indexOf(e2.tagName + '{') === 0) {
                        if (!this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                            styleSheet.tag = {
                                ...styleSheet.tag,
                                [e2.tagName]: styleSheet.tag[e2.tagName]
                                    ? [...styleSheet.tag[e2.tagName], '[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']']
                                    : ['[' + Object.keys(e2.properties).find((r: string) => r.includes('_hy-ghost_')) + ']'],
                            };
                        }
                    }

                    if (e2.children.length > 0 && !this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                        recursivelyParseCSS(e2.children);
                    }
                }
            });
        };

        recursivelyParseCSS(tree.children);

        // from stylesheet object adding ecapsulated classes to css
        Object.keys(styleSheet.class).forEach((key: string) => {
            css = css.replaceAll('.' + key + '{', '.' + key + styleSheet.class[key].join(',') + '{');
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp('.' + key + p + '{', 'g'), '.' + key + styleSheet.class[key].join(p + ',') + p + '{');
            });
        });

        // from stylesheet object adding ecapsulated ids to css
        Object.keys(styleSheet.id).forEach((key: string) => {
            css = css.replaceAll('#' + key + '{', '#' + key + styleSheet.id[key].join(',') + '{');
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp('#' + key + p + '{', 'g'), '#' + key + styleSheet.id[key].join(p + ',') + p + '{');
            });
        });

        // from stylesheet object adding ecapsulated element style to css
        Object.keys(styleSheet.tag).forEach((key: string) => {
            css = css.replaceAll(key + '{', key + styleSheet.tag[key].join(',') + '{');
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp(key + p + '{', 'g'), key + styleSheet.tag[key].join(p + ',') + p + '{');
            });
        });

        // console.log('doc tree : ', tree);
        const data: any = r.state() ? r.state() : {};

        css ? this.encapsulatedCSSList.push(css) : null;

        const doc = toH(h, tree).outerHTML;

        this.setState(data, r, doc);

        if (r.componentInit) {
            r.componentInit();
        }

        // adding comp tree without rendering mustache tags
        this.unRenderedcompTree.push(tree);

        // adding comp tree with rendering mustache tags
        const renderedTree = this.createUnRenderedTreeNode(Mustache.render(doc, data), r.selector);

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

    camelize(str: string) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

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
        // let d = document.implementation.createHTMLDocument('New Document');
        // const ele = d.createElement(selector);
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

                const tempCompTree = this.tempCompTree;

                const propertyBindings = this.propertyBindings;

                const changeClassNameToClass = (node: any): any => {
                    if (node.type === 'element') {
                        if (node.properties.hasOwnProperty('className')) {
                            const classList = node.properties.className;
                            const className = classList.join(' ');
                            node.properties.class = className;
                            delete node.properties.className;
                        }
                        if (node.children && node.children.length > 0) {
                            node.children.forEach((e: any) => {
                                changeClassNameToClass(e);
                            });
                        }
                    }
                    return node;
                };

                const makeVirtualDOM = (node: any): any => {
                    let attrList = node.getAttributeNames();
                    let attrObj = {};
                    attrList.forEach((a: any) => {
                        attrObj = { ...attrObj, [a]: node.getAttribute(a) };
                    });
                    let vDom = createElement(
                        node.tagName.toLowerCase(),
                        attrObj,
                        Array.from(node.childNodes).map((ele: any) => {
                            if (ele.nodeType === 3) return [ele.textContent];
                            const attrNames = Object.keys(ele.attributes);
                            const attrList = attrNames.map((a: string) => {
                                const attr = ele.attributes[a];
                                return {
                                    [attr.name]: attr.value,
                                };
                            });
                            let attrObj = {};
                            attrList.forEach((a: any) => {
                                attrObj = { ...attrObj, ...a };
                            });
                            return createElement(ele.tagName.toLowerCase(), attrObj, getChildrenFromHtmlNode(ele));
                        })
                    );
                    return vDom;
                };

                const getChildrenFromHtmlNode = (node: any): any => {
                    let children = Array.from(node.childNodes);
                    return children.map((child: any) => {
                        if (child.nodeType === Node.TEXT_NODE) {
                            return child.textContent;
                        } else if (child.nodeType === Node.COMMENT_NODE) {
                            return child.textContent;
                        } else {
                            const attrNames = Object.keys(child.attributes);
                            const attrList = attrNames.map((a: string) => {
                                const attr = child.attributes[a];
                                return {
                                    [attr.name]: attr.value,
                                };
                            });
                            let attrObj = {};
                            attrList.forEach((a: any) => {
                                attrObj = { ...attrObj, ...a };
                            });
                            return createElement(child.tagName.toLowerCase(), attrObj, getChildrenFromHtmlNode(child));
                        }
                    });
                };

                let outletCompTree = this.outletCompTree;

                Object.defineProperty(data, key, {
                    get() {
                        // console.log('getting value : ', internalValue);
                        dep.depend();
                        return internalValue;
                    },
                    set(newValue) {
                        console.warn('------------------------------------------Patching start--------------------------------------------------------');
                        // console.log('setting value of ' + key + ': ', newValue);
                        internalValue = newValue;

                        // renderUpdatedComponent(c, r.selector, data);
                        // console.log('comp Tree Before : ', outletCompTree);

                        outletCompTree = unRenderedcompTree.find((v: any) => v.tagName === r.selector);

                        // console.log('UnRendered html : ', toH(h, outletCompTree, { space: 'html' }).outerHTML);
                        // console.log('UnRendered tree : ', outletCompTree);

                        const rendered = Mustache.render(toH(h, outletCompTree, { space: 'html' }).outerHTML, data);

                        // console.log('Rendered with updated state : ', rendered);

                        //                         let d = document.implementation.createHTMLDocument('New Document');
                        //                         const ele = d.createElement(r.selector);
                        //                         ele.innerHTML = rendered;
                        //                         const hast: any = fromDom(ele.getElementsByTagName(r.selector)[0]);
                        //
                        //                         const tree = {
                        //                             type: hast.type,
                        //                             tagName: hast.tagName,
                        //                             properties: hast.properties,
                        //                             children: hast.children,
                        //                             data: hast.data,
                        //                             position: hast.position,
                        //                         };

                        // console.log('comp Tree in new Document : ', tree);

                        // app-child is still empty, only component updated state is rendered
                        // no child component is rendered
                        console.log('outletCompTree before: ', outletCompTree);

                        // console.log('Temp CompTree : ', tempCompTree);

                        outletCompTree = createUnRenderedTreeNode(rendered, r.selector);

                        console.log('outletCompTree after: ', outletCompTree);

                        // outletCompTree = tree;

                        // console.log("rendered html : ", rendered);

                        // Recursively Create DOM Tree for all the components
                        const recursivelyCreateDOMTree = (tree: any) => {
                            tree.children.forEach((e: any, i: number) => {
                                const c = components.declarations.find((r: Component) => r.selector === e.tagName);
                                if (c) {
                                    const data = tempCompTree.find((v: any) => v.tagName === c.selector);

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

                        outletCompTree.children.forEach((e: any, i: number) => {
                            const c = components.declarations.find((r: Component) => r.selector === e.tagName);
                            if (c) {
                                outletCompTree.children[i] = tempCompTree.find((v: any) => v.tagName === c.selector);
                                recursivelyCreateDOMTree(outletCompTree.children[i]);
                            }
                        });

                        console.log('outletCompTree after recursivelyCreateDOMTree: ', outletCompTree);

                        // comparison of the two DOM trees i.e old and new tree
                        //                         const newNodes: any[] = [];
                        //                         const oldNodes: any[] = [];
                        //
                        //                         const checNewNodes = (node: any) => {
                        //                             node.querySelectorAll('*').forEach((n: any, idx: number) => {
                        //                                 newNodes.push(n);
                        //                             });
                        //                         };
                        //                         const checOldNodes = (node: any) => {
                        //                             node.querySelectorAll('*').forEach((n: any, idx: number) => {
                        //                                 oldNodes.push(n);
                        //                             });
                        //                         };

                        // console.log('Outlet Comp Tree : ', outletCompTree);
                        // console.log('To Rendered html : ', toH(h, outletCompTree, { space: 'html' }).outerHTML);

                        const renderedVDom = makeVirtualDOM(toH(h, outletCompTree, { space: 'html' }));
                        console.log('To Rendered tree : ', renderedVDom);

                        let _t = tempCompTree.find((v: any) => v.tagName === r.selector);

                        // updating the _t with child nodes too...
                        _t.children.forEach((e: any, i: number) => {
                            const c = components.declarations.find((r: Component) => r.selector === e.tagName);
                            if (c) {
                                _t.children[i] = tempCompTree.find((v: any) => v.tagName === c.selector);
                                recursivelyCreateDOMTree(_t.children[i]);
                            }
                        });

                        _t = makeVirtualDOM(toH(h, changeClassNameToClass(_t), { space: 'html' }));
                        // console.log('Temp Comp Tree : ', _t);

                        const patches = diff(_t, renderedVDom);
                        console.log('Patches : ', patches);

                        if (rootNode) {
                            rootNode.querySelectorAll(renderedVDom.tagName).forEach((n: any, idx: number) => {
                                console.log('node to patch in root : ', n);
                                console.log('updated node : ', renderedVDom.render());
                                patch(n, patches);
                            });
                        }

                        // rootNode ? patch(rootNode, patches) : null;
                        //                         checNewNodes(toH(h, outletCompTree, { space: 'html' }));
                        //                         document.querySelectorAll(r.selector).forEach((compNode: any) => {
                        //
                        //
                        //                             const patches = diff(compNode, renderedVDom);
                        //                             console.log('patches : ', patches);
                        //                             console.log('node : ', compNode);
                        //                         });

                        // console.log('oldNodes : ', oldNodes);
                        // console.log('newNodes : ', newNodes);

                        // if (oldNodes.length === newNodes.length) {
                        //     for (let i = 0; i < oldNodes.length; i++) {
                        //         // console.log('nodes is : ', compareNodes([oldNodes[i], newNodes[i]]));
                        //         if (!oldNodes[i].isEqualNode(newNodes[i])) {
                        //             // if (!oldNodes[i].isSameNode(newNodes[i])) {
                        //             // console.log('node is not equal : ', oldNodes[i], newNodes[i]);
                        //             oldNodes[i].parentNode.replaceChild(newNodes[i].cloneNode(true), oldNodes[i]);
                        //         }
                        //     }
                        // }

                        // now when the component is updated and the view is rendered with updated state
                        // irrespective of children components
                        // need to update the temp comp tree with the new component node tree
                        tempCompTree.forEach((val: any, idx: number) => {
                            if (val.tagName === r.selector) {
                                tempCompTree[idx] = outletCompTree;
                            }
                        });

                        // checking if any property is bound to this key
                        // if there is then update it to the `newValue`
                        propertyBindings.forEach((val: any, idx: number) => {
                            if (val.parent === r.selector && val.propName === key) {
                                propertyBindings[idx].targetPropValue = newValue;
                                console.log('binding found : ', val);
                                const c = components.declarations.find((c: Component) => c.selector === val.target);
                                if (c) {
                                    c.state()[val.targetProp] = newValue;
                                }
                            }
                        });

                        console.warn('-------------------------------Patching done---------------------------------------------');

                        dep.notify();
                    },
                });
            }
        });
    }

    renderUpdatedComponent(rootComp: Component, outlet: string, updatedState: any) {
        this.outletCompTree = this.unRenderedcompTree.find(v => v.tagName === rootComp.selector);

        // idk but this might be needed in future for the children routes to work
        // const outletComp = this.outletCompTree.children.find((c: any) => c.tagName === outlet || c.tagName === DEFAULT_OUTLET);

        // console.log('Outlet Comp : ', this.outletCompTree);

        const rendered = Mustache.render(toH(h, this.outletCompTree, { space: 'html' }).outerHTML, updatedState);

        console.log('Rendered with updated state : ', rendered);

        this.outletCompTree = this.createUnRenderedTreeNode(rendered, rootComp.selector);

        // console.log("rendered html : ", rendered);

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
                if (c) {
                    const data = this.tempCompTree.find(v => v.tagName === c.selector);

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
            const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
            if (c) {
                this.outletCompTree.children[i] = this.tempCompTree.find(v => v.tagName === c.selector);
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
        const [routeOutComp, outlet] = this.router.navigateByPath(url) || [null, null];
        if (routeOutComp) {
            history.pushState(null, null, url);
            this.createRouterOutlet(routeOutComp, outlet);
        }
    }
}

class Dep {
    subscribers: any[] = [];
    constructor() {}

    depend(): void {
        /**
         * Will be called after every value getter
         */
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target);
        }

        // console.log('subscribers depend : ', this.subscribers);
    }

    notify(): void {
        /**
         * Will be called after every value setter
         */
        this.subscribers.forEach(sub => sub());
        // console.log('subscribers notify : ', this.subscribers);
    }
}

function compareVDOM() {
    // 1. 构建虚拟DOM
    const tree = createElement('div', { id: 'root' }, [
        createElement('h1', { style: 'color: blue', class: 'title' }, ['Tittle1']),
        createElement('p', ['Hello, virtual-dom']),
        createElement('input', { type: 'text', value: '' }),
        createElement('ul', [
            createElement('li', { key: 1, class: 'list 1' }, ['li1']),
            createElement('li', { key: 2 }, ['li2']),
            createElement('li', { key: 3 }, ['li3']),
            createElement('li', { key: 4 }, ['li4']),
        ]),
    ]);

    // 2. 通过虚拟DOM构建真正的DOM
    const root = tree.render();
    console.log(tree);
    document.body.appendChild(root);

    const newTree = createElement('div', { id: 'root' }, [
        createElement('h1', { style: 'color: blue', class: 'title title 2' }, ['Tittle2']),
        createElement('p', ['Hello, virtual-dom']),
        createElement('input', { type: 'text', value: '', class: 'input' }),
        createElement('ul', [
            createElement('li', { key: 1, class: 'list' }, ['li1']),
            createElement('li', { key: 2 }, ['li2']),
            createElement('li', { key: 3 }, ['li3']),
            createElement('li', { key: 4 }, ['li5']),
        ]),
    ]);

    // 4. 比较两棵虚拟DOM树的不同
    const patches = diff(tree, newTree);

    setTimeout(() => {
        patch(root, patches);
    }, 4000);
}

// compareVDOM();
