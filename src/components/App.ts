import { Component } from '../../lib/models/Component';

export default function App(): Component {
    const state = {};

    return {
        selector: 'app-root',
        view: () => /*html*/ `
        <app-nav></app-nav>
        <app-button></app-button>
        `,
        style: () => /*css*/ ``,
        state: () => state,
    };
}
