import Home from './components/Home';
import Gallery from './components/Gallery';
import GalleryView from './components/GalleryView';
import TotalPrice from './components/totalPrice';

const ROUTES = [
    { path: '/', view: Home, },
    { path: '/gallery', view: Gallery },
    { path: '/t-price', view: TotalPrice },
    { path: '/gallery/:id', view: GalleryView }
]

export default ROUTES;