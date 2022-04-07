import Home from './components/Home';
import Gallery from './components/Gallery';
import GalleryView from './components/GalleryView';
import TotalPrice from './components/totalPrice';
import { Route } from '../lib/router/Router';
import Button from './components/Button';

const ROUTES: Route[] = [
    // { path: '/', view: Home },
    { path: '/gallery', view: Gallery },
    { path: '/button', view: Button },
    { path: '/t-price', view: TotalPrice },
    { path: '/gallery/:id', view: GalleryView }
]

export default ROUTES;