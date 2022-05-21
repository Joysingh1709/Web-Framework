import { Component } from './Component';

// export interface ComponentRegistry {
//     declarations: Component[],
//     bootStrap: Component
// }

export interface ComponentRegistry {
    declarations: Function[];
    bootStrap: Function;
}
