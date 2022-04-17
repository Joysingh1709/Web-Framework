export interface Component {
    selector: string;
    componentInit?: () => void;
    componentDestroy?: () => void;
    componentOnChange?: () => void;
    view: () => string;
    state: () => any;
    style: () => string;
};
