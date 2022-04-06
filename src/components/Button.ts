import { Component } from "../core/Component";

export default function Button(params: any): Component {
    return {
        selector: 'app-button',
        view: () => {
            return `
                <button>Click Me</button>
            `;
        },
        style: () => ``, state: () => { }
    }
};