import { Component } from '../../lib/models/Component';

export default function Parent(): Component {
    const componentInit = () => {};

    const names = ['Johhn', 'Mark', 'Jane', 'Mary', 'John', 'Paul', 'Mary', 'Mark', 'Jane', 'John', 'Paul', 'Mary', 'Mark', 'Jane', 'John', 'Paul'];

    const state = {
        msg: 'Message from parent',
        names: [''],
        changeProp: () => {
            state.msg = names[Math.floor(Math.random() * names.length)];
            // state.names = names;
        },
    };

    return {
        selector: 'app-parent',
        view: () => {
            return /*html*/ `
            <p>Parent component works ---- {{msg}}</p>
            <!-- <button class="btn btn-primary" type="button" (onClick)="{sendMessage()}">Send message</button> -->
            <button (onClick)="{changeProp()}" class="btn btn-primary">Change Prop</button>
            <p>Method 1 : by binding property with event</p>
            <app-child [list]="{names}" [childEvent]="{msg}"></app-child>

            <hr>

            <!-- <p>Method 2 : using (emit)</p> -->
            <!-- <app-child (emit)="{method()}" ></app-child> -->
            `;
        },
        style: () => /*css*/ `
        `,
        state: () => state,
        componentInit,
    };
}
