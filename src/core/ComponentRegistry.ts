import { Component } from "./Component";

export interface ComponentRegistry {
    declarations: Component[],
    bootStrap: Component
}