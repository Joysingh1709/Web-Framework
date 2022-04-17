import { Component } from '../../lib/models/Component';
import CustomEvent from '../../lib/core/CustomEvent';

export default function Parent(): Component {

    const customEvent = new CustomEvent();

    function foo(): number {
        const a = 1;
        const b = 2;
        const addition = (a: number, b: number): number => {
            return a + b;
        }
        const result = addition(a, b);
        return result;
    }

    const componentInit = () => {
        // console.log(scopeParser.parseFunction(foo));
        // console.log(Scope(foo));
        // console.log(parser.parse(foo.toString()));
    }

    const state = {
        msg: 'Message from parent',
        sendMessage: (): CustomEvent => {
            console.log('send message');
            customEvent.triggerEvent('childEvent', { message: state.msg });
            return customEvent;
        }
    };

    return {
        selector: 'app-parent',
        view: () => {
            return /*html*/ `
            <p>Parent component works</p>
            <button class="btn btn-primary" type="button" (onClick)="{sendMessage()}">Send message</button>
            <app-child></app-child>
            `;
        },
        style: () => /*css*/ `
        `,
        state: () => state,
        componentInit
    };
}
