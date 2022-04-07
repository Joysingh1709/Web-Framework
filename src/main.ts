import CoreFramework from '../lib/core/core';
import './app.css';
import { router } from "../lib/router/Router";
new CoreFramework().init();
window.addEventListener("popstate", (e: any) => {
    console.log("popstate", e);
    router();
});

console.log(window.history.state);
// .addEventListener('navigate', (e: any) => {
//     console.log("navigate", e);
// });