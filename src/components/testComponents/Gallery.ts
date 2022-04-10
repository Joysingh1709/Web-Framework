import { Component } from "../../../lib/models/Component";

export default function Gallery(params: any): Component {
    return {
        selector: 'app-gallery',
        view: () => {
            return `
                <h1>Hello from Gallery component</h1>
                <a href="/" class="nav-link" data-link>Home</a>
                <router-out></router-out>
                <ul id="ul-1">
                    <li><a href="/" class="nav-link" data-link>Home</a></li>
                    <li class="link-ele"><a href="/gallery" class="nav-link" data-link>Gallery</a></li>
                </ul>
            `;
        },
        style: () => ``, state: () => { }
    }
};