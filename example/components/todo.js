import GUI from "../../lib/index.js"
import Item from "./item.js"
import item from "./item.js"

const h = GUI.createElement

export default class extends GUI.Component
{
    constructor()
    {
        super()

        this.state.items = [
            // new Item({ value: "foo1" }),
            // new Item({ value: "foo2" }),
            // new Item({ value: "foo3" }),
            // new Item({ value: "foo4" })
        ]
    
    }

    onkeydown(e)
    {
        if (e.keyCode != 13 || !e.target.value) return

        const items = this.state.items

        items.push(new Item({ value: e.target.value }))

        e.target.value = ""

        this.setState({ items })
    }

    render()
    {
        return h("todos",
        [
            h("h1", ["todos"]),
            h("input", { type: "text", placeholder: "What needs to be done?", keydown: e => this.onkeydown(e) }),
            h("ul", this.state.items)
        ])
    }
}