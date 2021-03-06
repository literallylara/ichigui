/**
 * @module Component
 */

import * as VDOM from "./vdom.js"
import { uuid } from "./util.js"

export default class Component
{
    /**
     * Creates a new component that can be mounted.
     * @param {Object} [props={}]
     * @param {Object} [children=[]]
     */
    constructor(props = {}, children = [])
    {
        this.props    = Object.seal(Object.assign({}, props))
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

        this.onBeforeSetState && this.onBeforeSetState()
    
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

        this.onSetState && this.onSetState()
    
        if (update || update === undefined)
        {
            this.update()
        }
    }

    /**
     * Saves the current state of the component.
     * If no `key` property is present it will be assigned a new uuid.
     * @returns {boolean} Whether or not saving was successful.
     */
    saveState()
    {
        if (!this.props.key) this.props.key = uuid()

        try
        {
            const json = JSON.stringify(
            {
                timestamp: Date.now(),
                data: this.state
            })

            this.onBeforeSaveState && this.onBeforeSaveState()

            window.localStorage.setItem(this.props.key, json)

            this.onSaveState && this.onSaveState()

            return true
        }
        catch(err)
        {
            return false
        }
    }

    /**
     * Returns the saved state object along with the timestamp.
     * @returns {undefined|object} `{ data: <object>, timestamp: <number> }`
     */
    getSavedState()
    {
        if (!this.props.key) return
        
        const item = window.localStorage.getItem(this.props.key)
        
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
     * @returns {boolean} Indicates whether the loading was successful.
     */
    loadState()
    {
        if (!this.props.key) return false

        const item = window.localStorage.getItem(this.props.key)

        if (!item) return false

        try
        {
            const json = JSON.parse(item)

            if (!json.data) return false

            this.onBeforeLoadState && this.onBeforeLoadState()

            Object.assign(this.state, json.data)

            return true
        }
        catch (err)
        {
            return false    
        }

        this.onLoadState && this.onLoadState()
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
            console.warn("Component already mounted.")
            return
        }
        
        this.onBeforeMount && this.onBeforeMount()
        this.props.onBeforeMount && this.props.onBeforeMount()

        this.vdom = this.render()
        this.vdom.root = true
        this.vdom.parent = parent
        this.vdom.component = this

        VDOM.mount(parent, this.vdom)

        this.onMount && this.onMount()
        this.props.onMount && this.props.onMount()
    }

    /**
     * Unmounts the component from its parent by removing the DOM tree
     * and calls the `onUnmount()` event.
     */
    unmount()
    {
        if (!this.vdom || !this.vdom.dom)
        {
            console.warn("Attempted to unmount with no dom present.")
            return
        }

        this.onBeforeUnmount && this.onBeforeUnmount()
        this.props.onBeforeUnmount && this.props.onBeforeUnmount()

        VDOM.unmount(this.vdom)
        delete this.vdom

        this.onUnmount && this.onUnmount()
        this.props.onUnmount && this.props.onUnmount()
    }
    
    /**
     * Forces a re-render of the component
     * and fires the `update` event.
     */
    update()
    {
        if (!this.vdom) return

        this.onBeforeUpdate && this.onBeforeUpdate()
    
        const parent = this.vdom.parent
        const vdom = this.render()

        VDOM.patch(this.vdom, vdom)

        this.vdom = vdom
        this.vdom.parent = parent
        this.vdom.component = this

        this.onUpdate && this.onUpdate()
    }
}
