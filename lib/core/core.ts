import Mustache from 'mustache';
import { Props } from '../models/Props';
import { router } from '../router/Router'

import { Components } from '../../src/Declarations';

import { toH } from 'hast-to-hyperscript';
import h from 'hyperscript';

import { fromDom } from 'hast-util-from-dom';
import { Component } from '../models/Component';
import { minify } from 'csso';

let target: any | Function;
export default class CoreFramework {

    propsArr: Props[] = [];

    pseudoClassList: string[] = [":hover", ":active", ":focus", ":visited", ":link", ":disabled", ":enabled", ":checked", ":indeterminate", ":in-range",
        ":out-of-range", ":read-only", ":read-write", ":required", ":optional", ":invalid", ":valid"];

    compTree: any = {};

    tempCompTree: any[] = [];

    encapsulatedCSSList: string[] = [];

    constructor() { }

    init(): void {
        document.addEventListener("DOMContentLoaded", () => {
            console.log("Dom Loaded");

            document.body.addEventListener("click", (e: any) => {
                if (e.target.matches("[data-link]")) {
                    e.preventDefault();
                    this.navigateTo(e.target.href);
                }
            });
            // router();
            this.createElements();
        });
    }

    createElements(): void {

        this.tempCompTree.push(this.registerComponent(Components.bootStrap));

        Components.declarations.forEach((c: Component, i: number) => {
            const tree = this.registerComponent(c);
            this.tempCompTree.push(tree);
        });

        // Recursively Create DOM Tree for all the components
        const recursivelyCreateDOMTree = (tree: any) => {
            tree.children.forEach((e: any, i: number) => {
                const c = Components.declarations.find((r: Component) => r.selector === e.tagName);
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
            const c = Components.declarations.find((r: Component) => r.selector === e.tagName);
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

        this.encapsulatedCSSList.forEach((css: string) => {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        });

        document.querySelector("#__app").innerHTML = toH(h, this.tempCompTree[0], { space: 'html' }).outerHTML;

    }

    registerComponent(r: Component): any {
        const data: any = r.state() ? r.state() : {};
        const html: string = Mustache.render(r.view(), data);
        let css: string = r.style() ? minify(r.style(), { restructure: false, comments: false }).css : null;

        let styleSheet: { class: any, id: any, tag: any } = { class: {}, id: {}, tag: {} };

        console.warn("-----------" + r.selector + "-----------");

        const tree = this.createTreeNode(html, r.selector);

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
                            params: argsArray
                        }

                        this.propsArr.push(newProp);

                        delete e.properties[key];
                        e.properties[newProp.propId as string] = "";
                    }

                }
            }

        });

        const recursivelyParseCSS = (child: any[]) => {
            child.forEach((e2: any) => {
                if (e2.type !== 'text') {
                    if (e2.properties.hasOwnProperty("className")) {

                        const ele2: string[] = e2.properties.className;

                        ele2.forEach((s: string) => {
                            if (s && css) {
                                // chacking if the class is there in components css
                                // and if class is added on multiple elements or not
                                if (css.includes("." + s)) {

                                    const id = "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]";
                                    styleSheet.class = { ...styleSheet.class, [s]: styleSheet.class[s] ? [...styleSheet.class[s], id] : [id] };
                                    // console.log("stylesheet : ", styleSheet);


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
                            // console.log("stylesheet : ", styleSheet);

                            // if (css[css.indexOf("#" + eleId) + ("#" + eleId).length] === '{') {
                            //     css = css.replace("#" + eleId, "#" + eleId + "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]");
                            // } else if (css[css.indexOf("#" + eleId) + ("#" + eleId).length] === '[') {
                            //     css = this.insertAt(css, css.indexOf("#" + eleId) + ("#" + eleId).length, "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "],");
                            // }

                        }
                    }
                    if (css && css.includes("}" + e2.tagName + "{")) {

                        if (!Components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                            styleSheet.tag = { ...styleSheet.tag, [e2.tagName]: styleSheet.tag[e2.tagName] ? [...styleSheet.tag[e2.tagName], "[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] : ["[" + Object.keys(e2.properties).find((r: string) => r.includes("_hy-ghost_")) + "]"] };
                            // console.log("stylesheet : ", styleSheet);
                        }

                    }
                    if (e2.children.length > 0 && !Components.declarations.find((r: Component) => r.selector === e2.tagName)) {
                        recursivelyParseCSS(e2.children);
                    }
                }
            });
        }

        recursivelyParseCSS(tree.children);

        // from stylesheet object adding ecapsulated classes to css
        Object.keys(styleSheet.class).forEach((key: string) => {
            css = css.replaceAll("." + key + "{", "." + key + styleSheet.class[key].join(",") + "{");
            this.pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp("." + key + p + "{", "g"), "." + key + styleSheet.class[key].join(p + ",") + p + "{");
            });
        });

        // from stylesheet object adding ecapsulated ids to css
        Object.keys(styleSheet.id).forEach((key: string) => {
            css = css.replaceAll("#" + key + "{", "#" + key + styleSheet.id[key].join(",") + "{");
            this.pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp("#" + key + p + "{", "g"), "#" + key + styleSheet.id[key].join(p + ",") + p + "{");
            });
        });

        // from stylesheet object adding ecapsulated element style to css
        Object.keys(styleSheet.tag).forEach((key: string) => {
            css = css.replaceAll(key + "{", key + styleSheet.tag[key].join(",") + "{");
            this.pseudoClassList.forEach((p: string) => {
                css = css.replaceAll(new RegExp(key + p + "{", "g"), key + styleSheet.tag[key].join(p + ",") + p + "{");
            });
        });

        // console.log("css for " + r.selector + " : ", css);

        css ? this.encapsulatedCSSList.push(css) : null;

        const doc = toH(h, tree).outerHTML;

        console.log("tree : ", tree);

        this.setState(data, r, doc);

        // customElements.get(r.selector) || customElements.define(r.selector, class extends CustomElementClass {
        //     constructor() {
        //         var s: any = super();
        //         s.innerHTML = Mustache.render(doc, r.state());
        //         // s.innerHTML = Mustache.render(r.view().view(), r.view().state());
        //     }
        // });

        return tree;
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

    watcher(functn: any): void {
        target = functn;

        // calls the function for the first time but we dont have to call the function we just
        // need to store the function and call it whenever needed

        // target();
        target = null;
    }

    setState(data: any, r: Component, html: string): void {
        Object.keys(data).forEach((key: any) => {
            let internalValue: any = data[key];

            if (typeof internalValue === "function") {
                // console.log(internalValue)
                this.watcher(internalValue);
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
                router(data);
            } else {
                document.querySelector(name).innerHTML = Mustache.render(html, data);
            }
        }
    }

    navigateTo(url: string): void {
        history.pushState(null, null, url);
        router();
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

class UUID {
    generate() {
        const hex = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const model = "xxxx4xxx";
        var str = "";
        for (var i = 0; i < model.length; i++) {
            var rnd = Math.floor(Math.random() * hex.length);
            str += model[i] == "x" ? hex[rnd] : model[i];
        }
        return str.toLowerCase();
    }
}



// appendToCompTree(node: any) {
//     const { type, tagName, properties, children, data, position } = node;
//     if (node && Object.keys(this.compTree).length !== 0) {
//
//         if (this.compTree.children.length !== 0) {
//             this.compTree.children.forEach((ele: any, i: number) => {
//                 const c = Components.declarations.find((r: Component) => r.selector === ele.tagName);
//                 if (c) {
//                     console.log(ele);
//                     // this.compTree.children[i] = this.createTreeNode(c.view());
//                     this.compTree.children[i] = node;
//                 }
//             });
//         } else {
//             // there are no elements in this component
//             console.log("-----no children-----");
//         }
//
//     } else {
//         this.compTree = {
//             type: type,
//             tagName: tagName,
//             properties: properties,
//             children: children,
//             data: data,
//             position: position
//         }
//     }
// }