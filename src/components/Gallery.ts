import { Component } from "../core/Component";

export default function Gallery(params: any): Component {
    return {
        selector: 'app-gallery',
        view: () => {
            return `
                <h1>Hello from Gallery component</h1>
                <a href="/" class="nav-link" data-link>Home</a>
            `;
        },
        style: () => ``, state: () => { }
    }
};