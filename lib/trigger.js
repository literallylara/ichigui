/**
 * @module Trigger
 */

export default class Trigger
{
    /**
     * Creates a new instance that can be used to register and fire events.
     */
    constructor()
    {
        this._events = {}
    }

    /**
     * Triggers the specified event.
     * @param {string} event 
     */
    fire(event, data)
    {
        const callbacks = this._events[event] || []

        callbacks.fired = true

        for (let i = 0; i < callbacks.length; i++)
        {
            callbacks[i].call(this, data)
        }

        let vdom = this.vdom

        while (vdom && vdom.parent)
        {
            vdom = vdom.parent

            if (vdom && vdom.component)
            {
                this.fire.call(vdom.component, event,
                {
                    type: event,
                    target: this,
                    data
                })
            }
        }
    }

    /**
     * Adds a new event listener.
     * @param {string} event 
     * @param {function} callback 
     */
    on(event, callback)
    {
        let callbacks = this._events[event]

        if (!callbacks)
        {
            callbacks = this._events[event] = []
        }

        callbacks.push(callback)
    }

    /**
     * Adds a new one-time event listener.
     * `callback ` will be executed even if the event has already fired.
     * @param {string} event 
     * @param {function} callback 
     */
    once(event, callback)
    {
        const callbacks = this._events[event]

        if (callbacks && callbacks.fired)
        {
            callback()
        }
        else
        {
            this.on(event, callback)
        }
    }

    /**
     * Removes all or one callback for a given event.
     * @param {string} event 
     * @param {function} [callback]
     */
    off(event, callback)
    {
        let callbacks = this._events[event]

        if (!callback)
        {
            callbacks.length = 0
            return
        }

        for (let i = 0; i < callbacks.length; i++)
        {
            if (callbacks[i] === callback)
            {
                callback.splice(i,1)
                return
            }
        }
    }
}