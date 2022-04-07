import { Component } from "../../lib/models/Component";

export default function Home(): Component {
    // function makeid(length: number): string {
    //     var result = '';
    //     var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    //     var charactersLength = characters.length;
    //     for (var i = 0; i < length; i++) {
    //         result += characters.charAt(Math.floor(Math.random() *
    //             charactersLength));
    //     }
    //     return result;
    // }
    const state = {
        title: "My Web Framework",
        data: ["foo", "bar", "ipsom"],
        world: "Joy",
        chTitle: () => {
            // setInterval(() => {
            //     // state.data.push(makeid(4))
            //     // state.title += makeid(5)
            // }, 2000);
        }
    }
    return {
        selector: 'app-home',
        view: () => {
            return `
            <h1 class="home-title p-2">{{title}}1</h1>
            <h1 id="ul-1" class="home-title p-2">{{title}}2</h1>
            <h1 class="home-title p-2">{{title}}3</h1>
            <ul id="ul-1">
                <li><a href="/" class="nav-link" data-link>Home</a></li>
                <li class="link-ele"><a href="/gallery" class="nav-link" data-link>Gallery</a></li>
                <li><a href="/gallery/2" class="nav-link" data-link>Gallery View</a></li>
                <li><a href="/t-price" class="nav-link" data-link>Total Price Calculator</a></li>
            </ul>
            Hello {{world}}!

            {{data}}

            <br>
            <br>
            <br>
            <br>

            <app-button (onClick)="{onClickFn()}"></app-button>

            <app-gallery class="gallery1"></app-gallery>
            <app-totalprice title="this is a title on app-total price" (onClick)="{onClickFn(data, name)}"></app-totalprice>
            <app-gallery class="gallery2" gallery></app-gallery>
            `;
        }, style: () => {
            return `
            .home-title{
                color: red;
            }
            .home-title:hover{
                color: #ffffff;
            }
            #ul-1{
                border: 1px solid black;
            }
            #ul-1 > li{
                font-style: italic;
            }
            .gallery1{
                color: blue;
            }
            .gallery2{
                color: purple;
            }
            li{
                color: red;
            }
            .nav-link{
                color: green !important;
                font-weight: bold;
                font-size: 1.5rem;
            }
            .nav-link:hover{
                color: red !important;
                font-weight: bold;
                font-size: 1.5rem;
            }
            `;
        }, state: () => state
    }
};