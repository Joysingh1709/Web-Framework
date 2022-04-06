class CustomElementBridge extends HTMLElement {

    componentFactory: any;
    observedAttributes: any;
    componentRef: any;
    applicationRef: any;
    changeDetectorRef: any;
    initialInputValues: any;

    /** 
     * we use templateName to handle this case @Input('aliasName');
    */
    // prepare(injector: any, component: any) {
    //     this.componentFactory = injector.get(ComponentFactoryResolver).resolveComponentFactory(component);
    //     this.observedAttributes = componentFactory.inputs.map(input => input.templateName);
    // }

    // destroy() {
    //     this.componentRef.destroy();
    // }

    //     initComponent(element: HTMLElement) {
    //         // first we need an componentInjector to initialize the component.
    //         // here the injector is from outside of Custom Element, user can register some of their own
    //         // providers in it.
    //         const componentInjector = Injector.create([], this.injector);
    // 
    //         this.componentRef = this.componentFactory.create(componentInjector, null, element);
    // 
    //         // Then we need to check whether we need to initialize value of component's input
    //         // the case is, before Angular Element is loaded, user may already set element's property.
    //         // those values will be kept in an initialInputValues map.
    //         this.componentFactory.inputs.forEach(prop => this.componentRef.instance[prop.propName] = this.initialInputValues[prop.propName]);
    // 
    //         // then we will trigger a change detection so the component will be rendered in next tick.
    //         this.changeDetectorRef.detectChanges();
    //         this.applicationRef = this.injector.get(ApplicationRef);
    // 
    //         // finally we will attach this component's HostView to applicationRef
    //         this.applicationRef.attachView(this.componentRef.hostView);
    //     }
    // 
    //     setInputValue(propName: string, value: any) {
    //         if (!this.componentRef) {
    //             this.initialInputValues[propName] = value;
    //             return;
    //         }
    //         if (this.componentRef[propName] === value) {
    //             return;
    //         }
    //         this.componentRef[propName] = value;
    //         this.changeDetectorRef.detectChanges();
    //     }
}