export default function Home() {
    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    const state = {
        title: "My Web Framework",
        data: ["foo", "bar", "ipsom"],
        world: "Joy",
        chTitle: () => {
            setInterval(() => {
                // state.data.push(makeid(4))
                // state.title += makeid(5)
            }, 2000);
        }
    }
    return {
        selector: 'app-home',
        view: () => {
            return `
                <h1>{{title}}</h1>
                <ul>
                    <li><a href="/" class="nav-link" data-link>Home</a></li>
                    <li><a href="/gallery" class="nav-link" data-link>Gallery</a></li>
                    <li><a href="/gallery/2" class="nav-link" data-link>Gallery View</a></li>
                    <li><a href="/t-price" class="nav-link" data-link>Total Price Calculator</a></li>
                </ul>
                Hello {{world}}!

                {{data}}

                <app-gallery></app-gallery>
                <app-totalprice></app-totalprice>
            `;
        }, state: () => state
    }
};