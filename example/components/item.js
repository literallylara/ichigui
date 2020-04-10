import GUI from "../../lib/index.js"

const h = GUI.createElement

export default class extends GUI.Component
{
    constructor(props)
    {
        super()

        this.state.checked = false
        this.state.value = props.value
    }

    onChange(e)
    {
        this.setState("checked", e.target.checked)
    }

    render()
    {
        const props =
        {
            type: "text",
            value: this.state.value
        }

        if (this.state.checked)
        {
            props.checked = true
            props.readonly = true
            props.style = "text-decoration:line-through"
        }

        return h("li",
        [
            h("label",
            [
                h("input", { type: "checkbox", change: e => this.onChange(e) }),
                h("span")
            ]),
            h("input", props)
        ]) 
    }
}