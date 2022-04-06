import Mustache from 'mustache';
import { Props } from './Props';
// import CustomElementClass from './ComponentFactory';
import { router } from './Router'

import { Components } from '../Declarations';

import { toH } from 'hast-to-hyperscript';
import h from 'hyperscript';

import { fromDom } from 'hast-util-from-dom';
import { Component } from './Component';

let target: any | Function;
export default class CoreFramework {

    propsArr: Props[] = [];

    compTree: any = {};

    tempCompTree: any[] = [];

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

        console.log("tempCompTree : ", this.tempCompTree[0]);

        document.querySelector("#__app").innerHTML = toH(h, this.tempCompTree[0], { space: 'html' }).outerHTML;

    }

    registerComponent(r: Component): any {
        const data: any = r.state() ? r.state() : {};
        const html: string = Mustache.render(r.view(), data);
        const css: string = r.style();

        console.warn(r.selector);
        // console.log("css for " + r.selector + " : ", css);
        // To JSON
        // var json = CSSJSON.toJSON(cssString);

        // To CSS
        // var css = CSSJSON.toCSS(jsonObject);

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

                    const recursivelyParseCSS = (tree: any) => {
                        console.log("tree : ", tree);
                    }

                    recursivelyParseCSS(e);


                }
            }
        });

        console.log(r.selector + " tree : ", tree);

        const doc = toH(h, tree).outerHTML;

        // console.log(r.selector + " : ", doc);

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