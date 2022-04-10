import { Component } from 'lib/models/Component';
import Mustache from 'mustache';
import { Route } from '../models/Route';
import { RouteMatch } from '../models/RouteMatch';
import { DEFAULT_OUTLET } from '../utils/DefaultOutlet';

export class Router {

    routerTree: Route[];
    routerState: any;
    activeRoute: any;

    url: string;
    path: string;

    routerHistory: any;

    constructor(ROUTES: Route[]) {
        this.routerTree = ROUTES;
        this.activeRoute = {};
        this.routerHistory = [];
        this.routerState = {};
        this.url = window.location.href;
        this.path = window.location.pathname;
    }

    init() {
        console.warn("Router initiated");
    }

    routerInit(data?: any): any {

        console.log("Path : ", this.path);

        let match = this.potentialMatch();

        if (!match) {
            match = {
                route: null,
                isMatch: false,
                result: null
            };
        } else {
            match.isMatch = true;
        }

        console.log(match);

        if (match.isMatch) {
            const view: Component = new match.route.view(this.getParams(match));

            // var rendered = Mustache.render(view.view(), data ? data : view.state());

            // document.querySelectorAll(DEFAULT_OUTLET.DEFAULT).forEach((routerOut: any) => {
            //     routerOut.innerHTML = rendered;
            // });

            return [view, match.route.outlet ? match.route.outlet : DEFAULT_OUTLET.DEFAULT];
        }
        return null;
    };

    navigateByPath(path: string): any {
        this.path = path;
        return this.routerInit();
    }

    potentialMatch(): RouteMatch {
        const potentialMatches = this.routerTree.map((route): RouteMatch => {
            return {
                route: route,
                result: this.path.match(this.pathToRegex(route.path))
            };
        });

        return potentialMatches.find(potentialMatch => potentialMatch.result !== null);
    }


    pathToRegex(path: string): RegExp {
        return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
    }

    getParams(match: RouteMatch) {
        if (match.result) {
            const values = match.result.slice(1);
            const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((result: any) => result[1]);
            return Object.fromEntries(keys.map((key, i) => {
                return [key, values[i]];
            }));
        }
    };
}
