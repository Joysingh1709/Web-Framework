class CustomElementClass extends HTMLElement {
    constructor() {
        super();
        // Check to see if observedAttributes are defined and has length
        if (this.constructor.observedAttributes && this.constructor.observedAttributes.length) {
            this.constructor.observedAttributes.forEach(attribute => {
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
    attributeChangedCallback(attrName, oldVal, newVal) {

    }
}

export default CustomElementClass;