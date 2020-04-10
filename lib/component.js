import * as VDOM from "./vdom.js"
import Trigger from "./trigger.js"

export default class extends Trigger
{
    /**
     * Creates a new component that can be mounted.
     * @param {Object} [props={}]
     * @param {Object} [children=[]]
     */
    constructor(props = {}, children = [])
    {
        super()

        this.props    = Object.freeze(Object.assign({}, props))
        this.state    = {}
        this.children = children
    }

    /**
     * Updates the component's state.
     * @param {string} state
     * @param {any} value
     * @param {boolean} [update=true] Whether or not to update the component.
     * Defaults to `true`.
     *//**
     * Updates the component's state.
     * @param {Object} stateObject
     * @param {boolean} [update=true] Whether or not to update the component.
     * Defaults to `true`.
     */
    setState()
    {
        let update
    
        if (typeof arguments[0] == "string")
        {
            const key = arguments[0]
            const val = arguments[1]
            
            this.state[key] = val
            
            update = arguments[2]
        }
        else
        {
            const state = arguments[0]
              
            for (let k in state)
            {
                this.state[k] = state[k]
            }

            update = arguments[1]
        }
    
        if (update || update === undefined)
        {
            this.update()
        }
    }

    /**
     * Mounts the component into the specified parent
     * and calls the `onMount()` event.
     * @param {HTMLElement} parent 
     */
    mount(parent)
    {
        if (this.vdom)
        {
            throw new Error("Component already mounted.")
        }

        this.vdom = this.render()

        VDOM.mount(parent, this.vdom)

        this.fire("mount")

        if (this.onMount)
        {
            this.onMount()
        }
    }

    /**
     * Unmounts the component from its parent by removing the DOM tree
     * and calls the `onUnmount()` event.
     */
    unmount()
    {
        if (!this.vdom)
        {
            throw new Error("Component not mounted.")
        }

        VDOM.unmount(this.vdom)
        delete this.vdom

       this.fire("unmount")

       if (this.onUnmount)
       {
           this.onUnmount()
       }
    }
    
    /**
     * Forces a re-render of the component
     * and fires the `update` event.
     */
    update()
    {
        if (!this.vdom) return
    
        let vdom = this.render()

        VDOM.patch(this.vdom, vdom)

        this.vdom = vdom
    
        this.fire("update")
    }
}
