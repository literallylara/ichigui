export default class
{
    constructor()
    {
        this._events = {}
    }

    fire(event, async = false)
    {
        if (async)
        {
            window.requestAnimationFrame(this.fire.bind(this, [event]))
            return
        }

        const callbacks = this._events[event] || []

        callbacks.fired = true

        for (let i = 0; i < callbacks.length; i++)
        {
            callbacks[i].apply(this, Array.prototype.slice.call(arguments,1))
        }
    }

    on(event, callback)
    {
        let callbacks = this._events[event]

        if (!callbacks)
        {
            callbacks = this._events[event] = []
        }

        callbacks.push(callback)
    }

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