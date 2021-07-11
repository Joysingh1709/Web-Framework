import Mustache from 'mustache';
import ROUTES from '../../src/routes';
import CustomElementClass from './CreateComponent';

// import { Observable } from 'rxjs';

let target;

export default class CoreJs {
    constructor() {
        this.createElements();
    }

    createElements() {
        ROUTES.map((r) => {
            /**
             * This code is implemented to create change detection strategy for the Dom
             * Manipulation for state change in real time.
             */

            let data = r.view().state() ? r.view().state() : {}
            let html = r.view().view()

            Object.keys(data).forEach(key => {
                let internalValue = data[key];

                if (typeof internalValue === "function") {
                    watcher(internalValue)
                }

                else {
                    const dep = new Dep();

                    Object.defineProperty(data, key, {
                        get() {
                            console.log("getting value : ", internalValue)
                            dep.depend()
                            return internalValue
                        },
                        set(newValue) {
                            console.log("setting value : ", newValue)
                            internalValue = newValue
                            console.log(data)
                            updateTemplate(r.view().selector, html, data);
                            dep.notify()
                        }
                    })
                }
            })

            function watcher(functn) {
                target = functn
                target()
                target = null
            }

            function updateTemplate(name, html, data) {
                if (!customElements.get(name)) {
                    console.warn(`Component Error : ${name} does not exist`)
                } else {
                    console.log(document.querySelector(name));
                    document.querySelector(name).innerHTML = Mustache.render(html, data)
                }
            }

            console.log(r.view().selector)

            customElements.get(r.view().selector) || customElements.define(r.view().selector, class extends CustomElementClass {
                constructor() {
                    super().innerHTML = Mustache.render(r.view().view(), r.view().state())
                }
            });
        })
    }

    pathToRegex(path) {
        return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
    }

    getParams(match) {
        if (match.result) {
            const values = match.result.slice(1);
            const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
            return Object.fromEntries(keys.map((key, i) => {
                return [key, values[i]];
            }));
        }
    };

    navigateTo(url) {
        history.pushState(null, null, url);
        this.router();
    };

    async router() {
        const potentialMatches = ROUTES.map(route => {
            return {
                route: route,
                result: location.pathname.match(this.pathToRegex(route.path))
            };
        });

        let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

        if (!match) {
            match = {
                route: ROUTES[0],
                isMatch: true,
                result: null
            };
        }

        console.log(match);

        const view = new match.route.view(this.getParams(match));

        var rendered = Mustache.render(await view.view(), await view.state());
        document.querySelector("#__app").innerHTML = rendered;
    };

    createState() {

    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            console.log("Dom Loaded");

            document.body.addEventListener("click", e => {
                if (e.target.matches("[data-link]")) {
                    e.preventDefault();
                    this.navigateTo(e.target.href);
                }
            })
            this.router();
        });
    }
}

class Dep {
    constructor() {
        this.subscribers = []
    }

    depend() {
        /**
         * Will be called after every value getter
         */
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target)
        }
    }

    notify() {
        /**
         * Will be called after every value setter
         */
        this.subscribers.forEach(sub => sub())
    }
}