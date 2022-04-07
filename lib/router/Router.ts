import { Component } from 'lib/models/Component';
import Mustache from 'mustache';
import path from 'path';
import ROUTES from '../../src/routes';

export type RouteMatch = {
    route: any,
    isMatch?: boolean,
    result: any
}

export type Route = {
    path: string,
    view: any
}

export async function router(data?: any) {
    // if (data) { console.log("data passed to update view : ", data) }
    const potentialMatches = ROUTES.map((route): RouteMatch => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

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
        const view: Component = new match.route.view(getParams(match));

        console.log(view);

        var rendered = Mustache.render(await view.view(), data ? data : await view.state());

        document.querySelectorAll('router-out').forEach((routerOut: any) => {
            routerOut.innerHTML = rendered;
        });
    }
};

export function pathToRegex(path: string): RegExp {
    return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
}

export function getParams(match: RouteMatch) {
    if (match.result) {
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((result: any) => result[1]);
        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
    }
};