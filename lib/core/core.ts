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

    outletCompTree: any = {};

    router: Router;

    unRenderedcompTree: any[] = [];
    tempCompTree: any[] = [];

    encapsulatedCSSList: string[] = [];

    constructor(declarations: ComponentRegistry) {
        this.components = declarations;
    }

    init(routes: Route[]): void {

        window.addEventListener("popstate", (e: any) => {
            // router();
            // this.router.
            console.log("call Router.router() on popstate : ", e);
        });

        document.addEventListener("DOMContentLoaded", () => {
            console.log("Dom Loaded");

            document.body.addEventListener("click", (e: any) => {
                if (e.target.matches("[data-link]")) {
                    e.preventDefault();
                    this.navigateTo(e.target.href.replace(window.location.origin, ""));
                }
                if (e.target.attributes.length > 0) {
                    e.preventDefault();
                    for (let i = 0; i < e.target.attributes.length; i++) {
                        const element = e.target.attributes.item(i);
                        if (element.name.includes("_hy-click_")) {
                            const _fn = this.propsArr.find((p: Props) => p.propId === element.name);
                            if (_fn) {
                                // if _fn.params contains array of params to pass in fn
                                // then pass in the params
                                // else dont pass anything
                                if (_fn.params.length > 0) {
                                    _fn.fn.apply(null, _fn.params);
                                } else {
                                    _fn.fn();
                                }
                            }
                        }
                    }
                }
            });
            this.createElements();

            // Router initialization
            this.router = new Router(routes);
            this.router.init();
            const [routeOutComp, outlet] = this.router.routerInit() || [null, null];
            routeOutComp ? this.createRouterOutlet(routeOutComp, outlet) : null;
        });
    }

    createElements(): void {

        console.log("Creating Elements");

        // Creating the elements for the components
        this.tempCompTree.push(this.registerComponent(this.components.bootStrap));

        this.components.declarations.forEach((c: Component, i: number) => {
            const tree = this.registerComponent(c);
            this.tempCompTree.push(tree);
        });
        // Created -----------------------------------------------------------------

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
                    tree.children[i].properties = { ...tree.children[i].properties, ...data.properties };
                    tree.children[i].position = data.position;

                    recursivelyCreateDOMTree(tree.children[i]);
                }
            });
        }

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

        console.warn("******************DOM Tree******************");
        console.log("DOM Tree : ", this.tempCompTree[0]);

        // Adding Encapsulated Css to the DOM head
        this.encapsulatedCSSList.forEach((css: string) => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });

        document.querySelector("#__app").innerHTML = toH(h, this.tempCompTree[0], { space: 'html' }).outerHTML;

    }

    createRouterOutlet(rootComp: Component, outlet?: string): any {

        console.log("root Comp : ", rootComp);
        console.log("outlet : ", outlet);

        this.outletCompTree = this.unRenderedcompTree.find(v => v.tagName === rootComp.selector);

        // idk but this might be needed in future for the children routes to work
        // const outletComp = this.outletCompTree.children.find((c: any) => c.tagName === outlet || c.tagName === DEFAULT_OUTLET);

        console.log("Outlet Comp : ", this.outletCompTree);

        const rendered = Mustache.render(toH(h, this.outletCompTree, { space: 'html' }).outerHTML, rootComp.state());

        console.log("Rendered : ", rendered);

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
                    tree.children[i].properties = { ...tree.children[i].properties, ...data.properties };
                    tree.children[i].position = data.position;

                    recursivelyCreateDOMTree(tree.children[i]);
                }
            });
        }

        this.outletCompTree.children.forEach((e: any, i: number) => {
            const c = this.components.declarations.find((r: Component) => r.selector === e.tagName);
            if (c) {
                this.outletCompTree.children[i] = this.tempCompTree.find(v => v.tagName === c.selector);
                recursivelyCreateDOMTree(this.outletCompTree.children[i]);
            }
        });

        console.log("Outlet DOM Tree : ", this.outletCompTree);
        document.querySelectorAll(outlet ? outlet : DEFAULT_OUTLET.DEFAULT).forEach((routerOut: any) => {
            routerOut.innerHTML = toH(h, this.outletCompTree, { space: 'html' }).outerHTML;
        });
    }

    registerComponent(r: Component): any {
        const data: any = r.state() ? r.state() : {};
        let css: string = r.style() ? minify(r.style(), { restructure: false, comments: false }).css : null;

        let styleSheet: { class: any, id: any, tag: any } = { class: {}, id: {}, tag: {} };

        console.warn("-----------" + r.selector + "-----------");

        // making html
        const html: string = Mustache.render(r.view(), data);
        const unRenderedHTML: string = r.view();

        // const tree = this.createTreeNode(html, r.selector);
        const tree = this.createTreeNode(unRenderedHTML, r.selector);

        // Adding onclick event to the elements
        tree.children.forEach((e: any) => {
            const props = e.properties;
            for (const key in props) {
                if (Object.prototype.hasOwnProperty.call(props, key)) {
                    if (props.hasOwnProperty("(onclick)") && key === "(onclick)") {
                        const element = props[key];
                        const functionName = element.substring(1, element.indexOf("("));
                        const args = element.substring(element.indexOf("(") + 1, element.indexOf(")"));
                        const argsArray = args.split(",");

                        const newProp: Props = {
                            type: "onclick",
                            name: functionName,
                            propId: "_hy-click_" + new UUID().generate(),
                            valueName: functionName,
                            params: argsArray.map((a: string) => r.state()[a.trim()]),
                            fn: r.state()[functionName]
                        }

                        this.propsArr.push(newProp);
                        console.log("Fn Props : ", newProp);


                        delete e.properties[key];
                        e.properties[newProp.propId as string] = "";
                    }

                }
            }

        });

        const recursivelyParseCSS = (child: any[]) => {
            child.forEach((e2: any) => {
                if (e2.type !== 'text' && e2.type !== 'comment') {
                    if (e2.properties.hasOwnProperty("className")) {

                        const ele2: string[] = e2.properties.className;

                        ele2.forEach((s: string) => {
                            if (s && css) {
                                // chacking if the class is there in components css
                                // and if class is added on multiple elements or not
                                if (css.includes("." + s)) {

                                    const id = "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]";
                                    styleSheet.class = { ...styleSheet.class, [s]: styleSheet.class[s] ? [...styleSheet.class[s], id] : [id] };


                                    // if (css[css.indexOf("." + s) + ("." + s).length] === '{') {
                                    //     css = css.replace("." + s, "." + s + "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]");
                                    // } else if (css[css.indexOf("." + s) + ("." + s).length] === '[') {
                                    //     css = this.insertAt(css, css.indexOf("." + s) + ("." + s).length, "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "],");
                                    // }
                                }
                            }
                        });
                    }
                    if (css && e2.properties.hasOwnProperty("id")) {
                        const eleId: string = e2.properties.id;
                        if (css.includes("#" + eleId)) {

                            styleSheet.id = { ...styleSheet.id, [eleId]: styleSheet.id[eleId] ? [...styleSheet.id[eleId], "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] : ["[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] };

                            // if (css[css.indexOf("#" + eleId) + ("#" + eleId).length] === '{') {
                            //     css = css.replace("#" + eleId, "#" + eleId + "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]");
                            // } else if (css[css.indexOf("#" + eleId) + ("#" + eleId).length] === '[') {
                            //     css = this.insertAt(css, css.indexOf("#" + eleId) + ("#" + eleId).length, "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "],");
                            // }

                        }
                    }
                    if (css && css.includes("}" + e2.tagName + "{")) {
                        if (!this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                            styleSheet.tag = { ...styleSheet.tag, [e2.tagName]: styleSheet.tag[e2.tagName] ? [...styleSheet.tag[e2.tagName], "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] : ["[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] };
                        }
                    }
                    // and if the element tag is the first element of the css
                    // eg, if the css is nav{}.class{}, then the first element is nav
                    if (css && css.includes(e2.tagName + "{") && css.indexOf(e2.tagName + "{") === 0) {
                        if (!this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                            styleSheet.tag = { ...styleSheet.tag, [e2.tagName]: styleSheet.tag[e2.tagName] ? [...styleSheet.tag[e2.tagName], "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] : ["[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] };
                        }
                    }

                    if (e2.children.length > 0 && !this.components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                        recursivelyParseCSS(e2.children);
                    }
                }
            });
        }

        recursivelyParseCSS(tree.children);

        // from stylesheet object adding ecapsulated classes to css
        Object.keys(styleSheet.class).forEach((key: string) => {
            css = css.replaceAll("." + key + "{", "." + key + styleSheet.class[key].join(",") + "{");
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp("." + key + p + "{", "g"), "." + key + styleSheet.class[key].join(p + ",") + p + "{");
            });
        });

        // from stylesheet object adding ecapsulated ids to css
        Object.keys(styleSheet.id).forEach((key: string) => {
            css = css.replaceAll("#" + key + "{", "#" + key + styleSheet.id[key].join(",") + "{");
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp("#" + key + p + "{", "g"), "#" + key + styleSheet.id[key].join(p + ",") + p + "{");
            });
        });

        // from stylesheet object adding ecapsulated element style to css
        Object.keys(styleSheet.tag).forEach((key: string) => {
            css = css.replaceAll(key + "{", key + styleSheet.tag[key].join(",") + "{");
            pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp(key + p + "{", "g"), key + styleSheet.tag[key].join(p + ",") + p + "{");
            });
        });

        console.log("doc tree : ", tree);

        css ? this.encapsulatedCSSList.push(css) : null;

        const doc = toH(h, tree).outerHTML;

        this.setState(data, r, doc);

        // adding comp tree without rendering mustache tags
        this.unRenderedcompTree.push(tree);

        // adding comp tree with rendering mustache tags

        const renderedTree = this.createUnRenderedTreeNode(Mustache.render(doc, data), r.selector);
        // const ele = document.createElement(r.selector);
        // ele.innerHTML = Mustache.render(doc, data);
        // const renderedTree = fromDom(ele);

        console.log("rendered tree : ", renderedTree);

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

    insertAt(str: string, index: number, value: string) {
        return str.slice(0, index) + value + str.slice(index);
    }

    idxOfAllOccurrences(searchStr: string, str: string, caseSensitive?: boolean): number[] {
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }

    createTreeNode(html: string, selector: string): any {
        const ele = document.createElement(selector);
        ele.innerHTML = html;
        const hast: any = fromDom(ele);

        // adding _hy-node_ Id to every node or Component
        hast.properties["_hy-node_" + new UUID().generate()] = "";

        // adding _hy_ghost Id to every element in the node for css encapsulation
        const addHyNodeIdToEveryElement = (tree: any) => {
            tree.children.forEach((e: any) => {
                if (e.type === "element") {
                    e.properties["_hy-ghost_" + new UUID().generate()] = "";
                    if (e.children.length > 0) {
                        addHyNodeIdToEveryElement(e);
                    }
                }
            });
        }

        hast.children.forEach((e: any) => {
            if (e.type === "element") {
                e.properties["_hy-ghost_" + new UUID().generate()] = "";
                if (e.children.length > 0) {
                    addHyNodeIdToEveryElement(e);
                }
            }
        });
        // ---------------------------------------------------------------------

        const tree = {
            type: hast.type,
            tagName: hast.tagName,
            properties: hast.properties,
            children: hast.children,
            data: hast.data,
            position: hast.position
        }
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
            position: hast.position
        }
        return tree;
    }

    watcher(functn: any, fnName: string): void {
        target = functn;

        // calls the function for the first time but we dont have to call the function we just
        // need to store the function and call it whenever needed

        // target();

        this.fnArr.push({ [fnName]: functn });
        console.log("fnArr : ", this.fnArr);

        target = null;
    }

    setState(data: any, r: Component, html: string): void {
        Object.keys(data).forEach((key: any) => {
            let internalValue: any = data[key];

            if (typeof internalValue === "function") {
                // console.log(internalValue)
                this.watcher(internalValue, key);
            }

            else {
                const dep = new Dep();

                const updateTemplate = this.updateTemplate;

                Object.defineProperty(data, key, {
                    get() {
                        console.log("getting value : ", internalValue);
                        dep.depend();
                        return internalValue;
                    },
                    set(newValue) {
                        console.log("setting value : ", newValue);
                        internalValue = newValue;

                        updateTemplate(r.selector, html, data);

                        dep.notify();
                    }
                })
            }
        })
    }

    updateTemplate(name: string, html: string, data: any): void {
        if (!customElements.get(name)) {
            console.warn(`Component Error : ${name} does not exist`);
        } else {
            if (!document.querySelector(name)) {
                // call router function to render the current view again
                // router(data);
            } else {
                document.querySelector(name).innerHTML = Mustache.render(html, data);
            }
        }
    }

    navigateTo(url: string): void {
        const [routeOutComp, outlet] = this.router.navigateByPath(url) || [null, null];
        if (routeOutComp) {
            history.pushState(null, null, url);
            this.createRouterOutlet(routeOutComp, outlet);
        }
    };
}

class Dep {
    subscribers: any[] = [];
    constructor() {
    }

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
        this.subscribers.forEach(sub => sub());
    }
}
