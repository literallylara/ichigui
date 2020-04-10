import YARC from "../../../lib/index.js"
import Item from "./item.js"
import Storage from "../util/storage.js"

const h = YARC.createElement

export default class extends YARC.Component
{
    constructor()
    {
        super()

        const items = Storage.get("items")

        this.state.items = []

        if (items)
        {
            items.forEach(item =>
            {
                item.onChange = checked => this.onItemChange(item, checked)
                this.state.items.push(item)
            })
        }
        
    }

    onkeydown(e)
    {
        if (e.keyCode != 13 || !e.target.value) return

        const items = this.state.items
        const item = { value: e.target.value }

        item.onChange = checked => this.onItemChange(item, checked)
        items.push(item)

        e.target.value = ""

        this.setState({ items })
        this.save()
    }

    onItemChange(item, checked)
    {
        item.checked = checked
        this.save()
    }

    save()
    {
        Storage.set("items", this.state.items)
    }

    render()
    {
        return h("todos",
        [
            h("h1", ["todos"]),
            h("input", { type: "text", placeholder: "What needs to be done?", keydown: e => this.onkeydown(e) }),
            h("ul", this.state.items.map(item => new Item(item)))
        ])
    }
}