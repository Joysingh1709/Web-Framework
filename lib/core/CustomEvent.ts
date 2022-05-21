import { EventEmitter } from 'events';

/**
 * @class CustomEvent
 * @extends EventEmitter
 * @description CustomEvent class provides a way to emit events and listen to events.
 * For Cross Component Communication.
 * @example
 * const customEvent = new CustomEvent();
 * customEvent.setEvent('eventName', (data) => {
 *    console.log(data);
 * });
 * @see triggerEvent
 * @example
 * customEvent.triggerEvent('eventName', {message: 'Hello World'});
 * @see setEvent
 * @example
 * customEvent.setEvent('eventName', (data) => {
 *   console.log(data);
 * });
 * @see removeEvent
 * @example
 * customEvent.removeEvent('eventName');
 * @see removeAllEvents
 * @example
 * customEvent.removeAllListeners();
 */
export default class CustomEvent extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * @param {string} eventName
     * @param {Function} callback
     * @memberof CustomEvent
     * @example
     * customEvent.setEvent('nav-click', (e) => {
     *    console.log(e);
     * });
     * @see triggerEvent
     * @example {triggerEvent()}
     * customEvent.triggerEvent('nav-click', {message: 'hello'});
     */
    setEvent(event: string, listener: (...args: any[]) => void): this {
        super.on(event, listener);
        return this;
    }

    /**
     * @param {string} eventName
     * @param {any} data
     * @memberof CustomEvent
     * @example
     * customEvent.triggerEvent('nav-click', {message: 'hello'});
     * @see setEvent
     * customEvent.setEvent('nav-click', (e) => {
     *   console.log(e);
     * });
     */
    triggerEvent(event: string, ...args: any[]): this {
        super.emit(event, ...args);
        return this;
    }

    /**
     * @param {string} eventName
     * @memberof CustomEvent
     * @example
     * customEvent.removeEvent('nav-click');
     * @see setEvent
     */
    removeEvent(event: string, listener: (...args: any[]) => void): this {
        super.removeListener(event, listener);
        return this;
    }

    /**
     * @param event
     * event name as string
     * @returns {CustomEvent}
     */
    removeAllEvent(event: string): this {
        super.removeAllListeners(event);
        return this;
    }
}
