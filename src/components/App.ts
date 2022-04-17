import { Component } from '../../lib/models/Component';

export default function App(): Component {
    const state = {};

    return {
        selector: 'app-root',
        view: () => /*html*/ `
        <app-nav></app-nav>
        <router-out></router-out>
        `,
        style: () => /*css*/ ``,
        state: () => state,
    };
}
