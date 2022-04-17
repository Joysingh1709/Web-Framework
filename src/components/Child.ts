import CustomEvent from 'lib/core/CustomEvent';
import { Component } from '../../lib/models/Component';

export default function Child(customEvent: CustomEvent): Component {

    const componentInit = () => {
        // customEvent.setEvent('childEvent', (data) => {
        //     state.msg = data.message;
        // });
    }

    const state = {
        msg: ''
    };

    return {
        selector: 'app-child',
        view: () => {
            return /*html*/ `
            <p>message from parent is : {{msg}}</p>

            `;
        },
        style: () => /*css*/ `
        `,
        state: () => state,
        componentInit
    };
}
