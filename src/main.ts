import CoreFramework from './core/core';
import './app.css';
import { router } from "./core/Router";
new CoreFramework().init();
window.addEventListener("popstate", () => {
    router();
});
