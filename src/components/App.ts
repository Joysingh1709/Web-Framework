import { Component } from "../../lib/models/Component";

export default function App(): Component {

    const state = {};

    return {
        selector: 'app-root',
        view: () => {
            return `
                <h1>App Title</h1>
                <app-home></app-home>
            `;
        },
        style: () => ``, state: () => state
    }
};