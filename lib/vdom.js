/**
 * @module VirtualDom
 */

import { unique } from "./util.js"

const DEBUG = false

/**
 * @typedef {Object} VirtualDom
 * @property {HTMLElement} dom
 * @property {Object} attributes
 * @property {Array<VirtualDom>} children
 */

 /**
 * @param {Component} Component
 * @returns {Component}
 *//**
 * @param {string} tag
 * @param {string} textContent
 * @returns {VirtualDom}
 *//**
 * @param {string} tag
 * @param {Object} attributes
 * @param {Array<VirtualDom|string>} [children]
 * @returns {VirtualDom}
 *//**
 * @param {string} tag
 * @param {Array<VirtualDom|string>} [children]
 * @returns {VirtualDom}
 */
export const create = (tag, ...args) =>
{
    let children = null
    let attributes = null
    let text = null

    // create(tag)
    if (args.length == 0)
    {
        children   = []
        attributes = {}
    }
    // create(tag, children)
    if (args[0] instanceof Array)
    {
        children   = args[0]
        attributes = {}
    }
    // create(tag, attributes, [children])
    else if (args[0] instanceof Object)
    {
        children   = args[1] || []
        attributes = args[0]
    }
    // create(tag, textContent)
    else if (typeof args[0] == "string")
    {
        text = args[0]
    }

    if (typeof tag == "function")
    {
        const component = new tag(attributes, children, text)
        const vdom = component.render()

        vdom.component = component
        component.vdom = vdom

        return vdom
    }
    else if (typeof tag == "object" && tag.render)
    {
        const component = tag
        const vdom = tag.render(attributes, children, text)

        vdom.component = component
        component.vdom = vdom

        return vdom
    }
    
    const vdom = { tag, attributes, children, text, dom: null }
    
    if (attributes)
    {
        if (attributes.mount)
        {
            vdom.onMount = attributes.mount
            delete attributes.mount
        }

        if (attributes.unmount)
        {
            vdom.onUnmount = attributes.unmount
            delete attributes.unmount
        }

        if (attributes.key)
        {
            vdom.key = attributes.key
            delete attributes.key
        }

        Object.keys(attributes).forEach(k =>
        {
            attributes[k] = { value: attributes[k] }
        })
    }

    if (vdom.children)
    {
        vdom.children = vdom.children.slice(0)
        
        vdom.children.forEach((v,i) =>
        {
            // convert string children to text vdom nodes
            if (typeof v == "string")
            {
                vdom.children[i] = create("#", v)
            }
            // component
            else if (typeof v == "function" || (typeof v == "object" && v.render))
            {
                vdom.children[i] = create(v)
            }

            vdom.children[i].parent = vdom
        })
    }

    return vdom
}

/**
 * Creates a vdom from a HTML tree
 * @param {Element|string} node
 * @param {boolean} svg Parse node string as svg
 * @returns {VirtualDom}
 */
export const from = (node, svg) =>
{
    // parse string to xml
    if (typeof node == "string")
    {
        let children = null

        if (svg)
        {
            const doc = new DOMParser().parseFromString(node, "text/xml")
            children = doc.documentElement.childNodes
        }
        else
        {
            const doc = new DOMParser().parseFromString(node, "text/html")
            children = doc.body.childNodes
        }

        if (children.length > 1)
        {
            node = document.createDocumentFragment()

            while (children.length)
            {
                node.appendChild(children[0])
            }
        }
        else
        {
            node = children[0]
        }
    }
    else
    {
        throw new Error("Argument must be of type string or instance of Element")
    }

    // parse node to vnode
    function parseRecursive(node, vnode, first)
    {
        if (node instanceof DocumentFragment)
        {
            vnode.tag = "[]"
        }
        else if (node instanceof Element)
        {
            vnode.tag = node.tagName
            vnode.attributes = {}

            for (let i = 0; i < node.attributes.length; i++)
            {
                const a = node.attributes[i]

                vnode.attributes[a.name] =
                {
                    value: a.value,
                    localName: a.localName,
                    namespaceURI: a.namespaceURI
                }
            }
        }
        else if (node instanceof Text)
        {
            vnode.tag = "#"
            vnode.text = node.data

            return vnode
        }

        vnode.children = []
        vnode.namespaceURI = node.namespaceURI

        Array.prototype.forEach.call(node.childNodes, (n,i) =>
        {
            vnode.children[i] = parseRecursive(n, {})
        })

        return vnode
    }

    return parseRecursive(node, {})
}

/**
 * Renders a <VirtualDom> object.
 * Attributes that are functions will be registered via `addEventListener`.
 * @param {VirtualDom} vdom 
 * @returns {DocumentFragment|HTMLElement|Text}
 */
export const render = vdom =>
{
    let el = null

    if (vdom.tag == "#")
    {
        return document.createTextNode(vdom.text)
    }
    else if (vdom.tag == "[]")
    {
        el = document.createDocumentFragment()
    }
    else
    {
        el = document.createElementNS(vdom.namespaceURI || "http://www.w3.org/1999/xhtml", vdom.tag)
    }

    if (vdom.attributes)
    {
        for (let k in vdom.attributes)
        {
            const v = vdom.attributes[k]

            if (typeof v.value == "function")
            {
                el.addEventListener(k, v.value)
            }
            else if (v.value)
            {
                el.setAttributeNS(v.namespaceURI, k, v.value)
            }
        }
    }

    if (vdom.text)
    {
        el.textContent = vdom.text
    }

    if (vdom.children)
    {
        vdom.children.forEach(c => mount(el, c))
    }

    return el
}

/**
 * Mounts a <VirtualDom> into given parent
 * and triggers the `mount` event.
 * @param {HTMLElement} parent 
 * @param {VirtualDom} vdom 
 * @param {boolean} [replace=false] Whether or not to replace the parent's
 * content. If set to `true`, any <VirtualDom> that has already been mounted
 * to the parent will be unmounted and receive the `unmount` event if possible.
 * Defaults to `false`.
 *//**
 * Mounts a <VirtualDom> into given parent
 * and triggers the `mount` event.
 * @param {HTMLElement} parent 
 * @param {VirtualDom} vdom 
 * @param {number} [index] The index at which to mount the node into the parent.
 */
export const mount = (parent, vdom, arg3) =>
{
    const replace = typeof arg3 == "boolean" ? arg3 : false
    const index = typeof arg3 == "number" ? arg3 : -1

    vdom.onBeforeMount && vdom.onBeforeMount.call(vdom)

    if (replace && parent.childNodes)
    {
        while (parent.childNodes.length)
        {
            let c = parent.childNodes[parent.childNodes.length-1]

            if (c._vdom)
            {
                unmount(c._vdom)
            }
            else
            {
                c.remove()
            }
        }
    }
    
    vdom.dom = render(vdom)
    vdom.dom._vdom = vdom

    if (index >= 0)
    {
        const child = parent.children[index]

        if (!child)
        {
            parent.appendChild(vdom.dom)
        }
        else
        {
            parent.insertBefore(vdom.dom, parent.children[index])
        }
    }
    else
    {
        parent.appendChild(vdom.dom)
    }

    vdom.onMount && vdom.onMount.call(vdom)
}

/**
 * Unmounts a <VirtualDom> from its parent
 * and triggers the `unmount` event.
 * @param {VirtualDom} vdom
 */
export const unmount = vdom =>
{
    if (!vdom.dom)
    {
        throw new Error("Attempted to unmount with no dom present.")
    }

    vdom.onBeforeUnmount && vdom.onBeforeUnmount.call(vdom)

    if (vdom.children)
    {
        vdom.children.forEach(c => unmount(c))
    }

    if (vdom.dom)
    {
        if (vdom.parent)
        {
            vdom.index = vdom.parent.children.indexOf(vdom)
        }

        vdom.dom.remove()
    }

    vdom.onUnmount && vdom.onUnmount.call(vdom)
}

/**
 * Patches the dom of a based on the vdom difference between a and b
 * @param {VirtualDom} a 
 * @param {VirtualDom} b 
 */
export const patch = (a, b) =>
{
    if (!a.dom)
    {
        throw new Error("Attempted to patch Vnode without dom.")
    }

    if (!a.dom.parentNode)
    {
        mount(a.parent.dom, a, a.index)
    }

    const dom = a.dom

    // the tag has changed, force remount
    if (a.tag !== b.tag)
    {
        const parent = dom.parentNode
        unmount(a)
        mount(parent, b)

        return b
    }

    const aOld = a.attributes || {}
    const aNew = b.attributes || {}

    const attrs = unique(Object.keys(aOld).concat(Object.keys(aNew)))

    for (let i = 0; i < attrs.length; i++)
    {
        const k = attrs[i]

        if (k == "key") continue

        const vOld = aOld[k]
        const vNew = aNew[k]

        // DEBUG && console.log("[DEBUG] compare")
        
        // removed attribute
        if (vNew.value === undefined && vOld.value !== undefined)
        {
            DEBUG && console.log(`[DEBUG] patch: ${k} (${vOld.value} -> ${vNew.value})`)

            if (typeof vOld.value == "function")
            {
                dom.removeEventListener(k, vOld.value)
            }
            else
            {
                delete dom[k]
                dom.removeAttributeNS(vOld.namespaceURI, vOld.localName || k)
            }
        }
        // changed attribute
        else if (vNew.value !== vOld.value)
        {
            if (typeof vNew.value == "function")
            {
                if (vOld.value !== vNew.value)
                {
                    DEBUG && console.log(`[DEBUG] patch: ${k} (function)`)

                    dom.removeEventListener(k, vOld.value)
                    dom.addEventListener(k, vNew.value)
                }
            }
            // new attribute
            else
            {
                DEBUG && console.log(`[DEBUG] patch: ${k} (${vOld.value} -> ${vNew.value})`)

                dom[k] = vNew.value
                dom.setAttributeNS(vNew.namespaceURI, k, vNew.value)
            }
        }
    }

    const cOld = (a.children || []).slice(0)
    const cNew = (b.children || []).slice(0)

    let cLen = Math.max(cOld.length, cNew.length)

    for (let i = 0; i < cLen; i++)
    {
        const vOld = cOld[i]
        const vNew = cNew[i]

        if (vOld && vNew)
        {
            if (vOld.key !== vNew.key)
            {
                const j = cNew.findIndex(v => v.key === vOld.key)
   
                if (j != -1)
                {
                    if (j == i)
                    {
                        patch(vOld, vNew)
                        continue
                    }

                    DEBUG && console.log(`DEBUG: moved (${i} -> ${j})`)

                    const parent = vOld.dom.parentNode

                    if (parent.childNodes[j])
                    {
                        parent.insertBefore(vOld.dom, parent.childNodes[j])
                    }
                    else
                    {
                        parent.appendChild(vOld.dom)
                    }

                    cOld.splice(i, 1)
                    cOld.splice(Math.min(j,cOld.length), 0, vOld)
                    i -= 1
                }
                else
                {
                    DEBUG && console.log(`DEBUG: removed (${i})`)

                    cOld.splice(i, 1)
                    i -= 1
                    cLen = Math.max(cOld.length, cNew.length)

                    vOld.dom.remove()
                }
            }
            else
            {
                patch(vOld, vNew)
            }
        }
        else if (vNew)
        {
            mount(dom, vNew)
        }
        else
        {
            unmount(vOld)
        }
    }

    if (a.text != b.text)
    {
        dom.textContent = b.text
    }

    b.dom = dom
}