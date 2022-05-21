import { Component } from '../../lib/models/Component';

export default function Child(): Component {
    const componentInit = () => {
        console.log('event passed : ', state.childEvent);
    };

    const state: any = {
        childEvent: 'initial value',
        btnText: 'check event',
        list: ['itme 1', 'item 2', 'item 3'],
        checkEvent: () => {
            console.log('check event : ', state.childEvent);
            state.childEvent = 'changed';
        },
    };

    return {
        selector: 'app-child',
        view: () => {
            return /*html*/ `
            <p>Child works...!, message from parent is : {{childEvent}}</p>

            <button (onClick)="{checkEvent()}" class="btn btn-primary">{{btnText}}</button>

            <!-- <div>
                {{#list}}
                    <p>{{.}}</p>
                {{/list}}
            </div> -->
            `;
        },
        style: () => /*css*/ `
        .btn{
            margin: 20px 40px;
        }
        `,
        state: () => state,
        componentInit,
    };
}
