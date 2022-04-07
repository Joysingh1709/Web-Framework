import CoreFramework from '../lib/core/core';
import './app.css';
import { router } from "../lib/router/Router";
new CoreFramework().init();
window.addEventListener("popstate", () => {
    router();
});
