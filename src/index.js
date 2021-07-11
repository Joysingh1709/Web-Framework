import CoreJs from '../lib/core/core';

let core = new CoreJs();
core.init();
window.addEventListener("popstate", () => {
    core.router();
});
