export default function GalleryView(params) {

    const state = {
        data: [
            "1",
            "2",
            "3"
        ],
        params: params
    }

    return {
        selector: 'app-galleryview',
        view: () => {
            return `
                <h1>Hello from Gallery View component with param : {{params.id}}</h1>
                    {{#data}}
                    <ul>
                        <li>{{.}}</li>
                    </ul>
                    {{/data}}
                <a href="/" class="nav-link" data-link>Home</a>
            `;
        }, state: () => state
    }
};