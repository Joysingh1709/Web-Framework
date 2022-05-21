import { Component } from '../../../lib/models/Component';
import CustomEvent from '../../../lib/core/CustomEvent';

export default function Nav(): Component {
    const customEvent = new CustomEvent();

    const componentInit = () => {
        customEvent.setEvent('nav-click', e => {
            console.log(e);
        });
    };

    const state = {
        checkInpVal: (val: any) => {
            if (val) {
                alert(val);
                customEvent.triggerEvent('checkInpVal', val);
                state.toggleBtnText();
            }
        },
        count: 0,
        bubble: 'bubble 2nd param',
        btnText: 'Check Value',
        inputChange: (e: any) => {
            state.inputVal = e.target.value;
            state.inputVal ? state.count++ : (state.count = 0);
        },
        inputVal: '',
        toggleBtnText: () => {
            console.log('toggle btn text');
            state.btnText = state.btnText === 'Check Value' ? 'Clicked' : 'Check Value';
        },
    };

    const catchEvent = () => {
        customEvent.setEvent('checkInpVal', e => {
            console.log(e);
        });
    };
    catchEvent();

    return {
        selector: 'app-nav',
        view: () => {
            return /*html*/ `
            <nav id="nav" class="navbar navbar-dark bg-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Navbar</a>
                    <!-- <button  class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button> -->
                    <!-- Example single danger button -->
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            Navigate
                        </button>
                        <ul class="dropdown-menu">
                            <li><a data-link class="dropdown-item" href="parent">Cross Comp Comm.</a></li>
                            <li><a data-link class="dropdown-item" href="login">Form</a></li>
                        </ul>
                    </div>
                    <button type="button" (onClick)="{checkInpVal(inputVal)}" class="btn btn-primary">{{btnText}}</button>
                </div>
            </nav>

            <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">Toggle top offcanvas</button>

            <h2 >Two way data binding : </h2>

            <input type="text" name="input" (onChange)="{inputChange($event)}" (bind)="{inputVal}">
            <!-- (onChange)="{inputChange($event)}"  -->
            <p>{{inputVal}}</p>

            <p>Change event check count : {{count}}</p>

            <button type="button" (onClick)="{checkInpVal(inputVal)}" class="btn btn-primary">{{btnText}}</button>

            <button type="button" (onClick)="{toggleBtnText()}" class="btn btn-primary">Toggle button text</button>

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
        componentInit,
    };
}
