import { Component } from '../../../lib/models/Component';

export default function Nav(): Component {
    const state = {
        navToggle: () => {
            console.log('navToggle');
        },
        checkInpVal: (val: any) => {
            alert(val);
        },
        bubble: 'bubble 2nd param',
        btnText: 'Check Value',
        inputChange: (e: any) => {
            state.inputVal = e.target.value;
        },
        inputVal: 'input value',
    };
    return {
        selector: 'app-nav',
        view: () => {
            return /*html*/ `
            <nav id="nav" class="navbar navbar-dark bg-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Navbar</a>
                    <button  class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <button type="button" (onClick)="{checkInpVal(inputVal)}" class="btn btn-primary">{{btnText}}</button>
                </div>
            </nav>

            <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">Toggle top offcanvas</button>

            <h2 >Two way data binding : </h2>

            <input type="text" name="input" (onChange)="{inputChange($event)}">

            <p>{{inputVal}}</p>

            <button type="button" (onClick)="{checkInpVal(inputVal)}" class="btn btn-primary">{{btnText}}</button>

            <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
                <div class="offcanvas-header">
                    <h5 id="offcanvasTopLabel">Offcanvas top</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div> 
                <div class="offcanvas-body">
                    ...
                </div>
            </div>
            `;
        },
        style: () => /*css*/ `
            .btn{
                margin: 20px;
            }`,
        state: () => state,
    };
}
