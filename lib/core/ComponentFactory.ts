class CustomElementClass extends HTMLElement {
    constructor() {
        super();
        //         console.log("this : ", this.attributes);
        // 
        //         const clickBtn = this.attributes.getNamedItem("click")
        // 
        //         if (clickBtn) {
        // 
        //             console.log(this.nodeName + " has : ", clickBtn)
        // 
        //         }

        // this.addEventListener('click', e => {
        //     console.log("click event");
        // })


        // Check to see if observedAttributes are defined and has length
        if (this.constructor.prototype.observedAttributes && this.constructor.prototype.observedAttributes.length) {
            this.constructor.prototype.observedAttributes.forEach((attribute: string) => {
                Object.defineProperty(this, attribute, {
                    get() { return this.getAttribute(attribute); },
                    set(attrValue) {
                        if (attrValue) {
                            this.setAttribute(attribute, attrValue);
                        }
                        else {
                            this.removeAttribute(attribute);
                        }
                    }
                })
            });
        }
    }

    connectedCallback() {

    }
    disconnectedCallback() {

    }
    attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {

    }
}

export default CustomElementClass;