import { Component } from "../../lib/models/Component";

export default function App(): Component {

    const state = {};

    return {
        selector: 'app-root',
        view: () => {
            return `
            <app-nav></app-nav>
            <app-button></app-button>
            `;
        },
        style: () => ``, state: () => state
    }
};