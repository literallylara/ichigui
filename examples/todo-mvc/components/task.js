const h = YARC.createElement

export default class extends YARC.Component
{
    constructor(props)
    {
        super(props)

        this.state.checked = props.checked
        this.state.value = props.value
    }

    onInput(e)
    {
        this.setState("value", e.target.value)
        this.saveState()
    }

    onToggle(e)
    {
        this.setState("checked", e.target.checked)
        this.saveState()
    }

    onDelete()
    {
        this.unmount()
    }

    render()
    {
        const inputProps =
        {
            type: "text",
            input: e => this.onInput(e),
            value: this.state.value
        }

        const toggleProps =
        {
            type: "checkbox",
            input: e => this.onToggle(e)
        }

        if (this.state.checked)
        {
            inputProps.readonly = true
            inputProps.style = "text-decoration:line-through"

            toggleProps.checked = true
        }

        return h("li",
        [
            h("label",
            [
                h("input", toggleProps),
                h("span")
            ]),
            h("input", inputProps),
            h("span", { class: "delete", click: () => this.onDelete() })
        ]) 
    }
}