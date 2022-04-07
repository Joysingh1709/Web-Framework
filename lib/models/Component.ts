export interface Component {
    selector: string;
    view: () => string;
    state: () => any;
    style: () => string;
}