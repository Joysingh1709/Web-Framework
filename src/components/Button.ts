import {Component} from '../../lib/models/Component';

export default function Button(): Component {
  const state = {
    btnText1: 'Click me 1',
    btnText2: 'Click me 2',
    prop1: {name: 'prop1', value: 'prop1'},
    prop2: 'this is 2nd prop',
    btnClick1: (data: any, data2: any) => {
      alert(data + ' ' + data2);
    },
    btnClick2: () => {
      alert('btnClick2');
    },
  };

  return {
    selector: 'app-button',
    view: () => {
      return `
            <button (onClick)="{btnClick1(prop1, prop2)}" 
                class="btn btn-primary" type="button">{{btnText1}}</button>
            <button (onClick)="{btnClick2()}" 
                class="btn btn-primary" type="button">{{btnText2}}</button>
            `;
    },
    style: () => ``, state: () => state,
  };
}
