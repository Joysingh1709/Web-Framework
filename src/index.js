import CoreJs from '../lib/core/core';
import './app.css';
let core = new CoreJs();
core.init();
window.addEventListener("popstate", () => {
    core.router();
});
