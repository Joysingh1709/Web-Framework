import Home from './components/Home';
import App from './components/App';
import Gallery from './components/Gallery';
import GalleryView from './components/GalleryView';
import TotalPrice from './components/totalPrice';
import Button from './components/Button';
import { ComponentRegistry } from './core/ComponentRegistry';

export const Components: ComponentRegistry = {
    declarations: [
        Home(),
        Gallery(null),
        GalleryView(null),
        TotalPrice(null),
        Button(null)
    ],
    bootStrap: App()
}