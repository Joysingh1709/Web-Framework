import { Component } from "../core/core";

export default function TotalPrice(params: any): Component {
  const state = {
    price: 5,
    quantity: 2,
    total: 0,
    calTotal: () => {
      // console.log("calTotal")
      state.total = state.price * state.quantity
    },
    changePrice: () => {
      setInterval(() => {
        state.price = state.price + 1
        // console.log("this.price : ", state.price)
      }, 5000);
    }
  }
  return {
    selector: 'app-totalprice',
    view: () => {
      return `
                <h1>Hello from Total Price component</h1>
                <a href="/" class="nav-link" data-link>Home</a>
                <br/>

                <label for=""><strong>Price : </strong>{{price}}</label>
                <br/>
                <label for=""><strong>Quantity : </strong>{{quantity}}</label>

                <br/>
                <br/>
                <br/>
                <h1>Total : {{total}}</h1>

            `;
    }, state: () => state
  }
};