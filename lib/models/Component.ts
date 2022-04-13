export type Component = {
    selector: string;
    view: () => string;
    state: () => any;
    style: () => string;
};
