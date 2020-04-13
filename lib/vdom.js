/**
 * @module VirtualDom
 */

/**
 * @typedef {Object} VirtualDom
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
            let v = vdom.attributes[k]

            if (typeof v == "function")
            {
                el.addEventListener(k, v)
            }
            else if (v !== undefined)
            {
                el.setAttributeNS(v.namespaceURI, k, v)
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
            child.insertAdjacentElement("beforebegin", vdom.dom)
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

    const aOld = a.attributes || []
    const aNew = b.attributes || []
    
    Object.keys(aOld).concat(Object.keys(aNew)).forEach(k =>
    {
        const vOld = aOld[k]
        const vNew = aNew[k]
    
        if (vNew === undefined)
        {
            if (typeof vOld == "function")
            {
                dom.removeEventListener(k, vOld)
            }
            else
            {
                dom[k] = vNew
                dom.removeAttribute(k)
            }
        }
        else if (vNew !== vOld)
        {
            if (typeof vNew == "function")
            {
                dom.removeEventListener(k, vOld)
                dom.addEventListener(k, vNew)
            }
            else
            {
                dom[k] = vNew
                dom.setAttributeNS(null, k, vNew)
            }
        }
    })

    const cOld = a.children || []
    const cNew = b.children || []
    const cLen = Math.max(cOld.length, cNew.length)

    for (let i = 0; i < cLen; i++)
    {
        const vOld = cOld[i]
        const vNew = cNew[i]

        if (vOld && vNew)
        {
            patch(vOld, vNew)
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