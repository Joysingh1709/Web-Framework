import Mustache from 'mustache';
import ROUTES from '../../src/routes';
import CustomElementClass from './CreateComponent';
import { router, Route } from './Router'

let target: any | Function;
export default class CoreFramework {
    constructor() {
        this.createElements();
    }

    createElements(): void {
        ROUTES.map((r: Route) => {
            /**
             * This code is implemented to create change detection strategy for the Dom
             * Manipulation for state change in real time.
             */

            const data: any = r.view().state() ? r.view().state() : {};
            const html: string = r.view().view();

            this.setState(data, r, html);

            customElements.get(r.view().selector) || customElements.define(r.view().selector, class extends CustomElementClass {
                constructor() {
                    var s: any = super();
                    s.innerHTML = Mustache.render(r.view().view(), r.view().state());
                    // super().innerHTML = Mustache.render(r.view().view(), r.view().state());
                }
            });
        })
    }

    watcher(functn: any): void {
        target = functn;
        target();
        target = null;
    }

    setState(data: any, r: Route, html: string): void {
        console.warn("setState called");
        Object.keys(data).forEach((key: any) => {
            let internalValue: any = data[key];

            if (typeof internalValue === "function") {
                console.log(internalValue)
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

                        updateTemplate(r.view().selector, html, data);

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

    init(): void {
        document.addEventListener("DOMContentLoaded", () => {
            console.log("Dom Loaded");

            document.body.addEventListener("click", (e: any) => {
                if (e.target.matches("[data-link]")) {
                    e.preventDefault();
                    this.navigateTo(e.target.href);
                }
            })
            router();
        });
    }
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

export type Component = {
    selector: string,
    view: () => string,
    state: () => any
}