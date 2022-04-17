import { EventEmitter } from "events";

export default class CustomEvent extends EventEmitter {
    constructor() {
        super();
    }

    setEvent(event: string, listener: (...args: any[]) => void): this {
        super.on(event, listener);
        return this;
    }

    triggerEvent(event: string, ...args: any[]): this {
        super.emit(event, ...args);
        return this;
    }

    removeEvent(event: string, listener: (...args: any[]) => void): this {
        super.removeListener(event, listener);
        return this;
    }

    removeAllEvent(event: string): this {
        super.removeAllListeners(event);
        return this;
    }
}