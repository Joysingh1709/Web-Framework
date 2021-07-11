export default function Gallery(params) {
    return {
        selector: 'app-gallery',
        view: () => {
            return `
                <h1>Hello from Gallery component</h1>
                <a href="/" class="nav-link" data-link>Home</a>
            `;
        }, state: () => { }
    }
};