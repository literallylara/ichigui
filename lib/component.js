/**
 * @module Component
 */

import * as VDOM from "./vdom.js"
import Trigger from "./trigger.js"

export default class Component extends Trigger
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
     * Saves the current state of the component.
     * @param {string} key The identifier under which the state
     * will be saved to localStorage
     */
    saveState(key)
    {
        window.localStorage.setItem(key, JSON.stringify(
        {
            timestamp: Date.now(),
            data: this.state
        }))
    }

    /**
     * Returns the saved state object along with the timestamp.
     * @param {string} key The key that was used to save the state.
     */
    getSavedState(key)
    {
        const item = window.localStorage.getItem(key)
        
        if (!item) return

        try
        {
            return JSON.parse(item)
        }
        catch (err)
        {
            return
        } 
    }

    /**
     * Loads a given state from the localstorage
     * and applies it to the component and its descendants.
     * @param {string} key The key that was used to save the state.
     * @returns {boolean} Indicates whether the loading was successful.
     */
    loadState(key)
    {  
        try
        {
            const item = window.localStorage.getItem(key)

            if (!item) return false

            const json = JSON.parse(item)

            if (!json.data) return false

            Object.assign(this.state, json.data)

            return true
        }
        catch (err)
        {
            return false    
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
        this.vdom.parent = parent
        this.vdom.component = this

        VDOM.mount(parent, this.vdom)

        this.fire("mount")

        if (this.props.onMount)
        {
            this.props.onMount()
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

        if (this.props.onUnmount)
        {
            this.props.onUnmount()
        }
    }
    
    /**
     * Forces a re-render of the component
     * and fires the `update` event.
     */
    update()
    {
        if (!this.vdom) return
    
        const parent = this.vdom.parent
        const vdom = this.render()

        VDOM.patch(this.vdom, vdom)

        this.vdom = vdom
        this.vdom.parent = parent
        this.vdom.component = this
    
        this.fire("update")
    }
}
