import YARC from "../../../lib/index.js"

const h = YARC.createElement

export default class extends YARC.Component
{
    constructor(props)
    {
        super(props)

        this.state.checked = props.checked
        this.state.value = props.value
    }

    onChange(e)
    {
        this.setState("checked", e.target.checked)
        
        if (this.props.onChange)
        {
            this.props.onChange(e.target.checked)
        }
    }

    render()
    {
        const inputProps =
        {
            type: "text",
            value: this.state.value
        }

        const checkboxProps =
        {
            type: "checkbox",
            change: e => this.onChange(e)
        }

        if (this.state.checked)
        {
            inputProps.readonly = true
            inputProps.style = "text-decoration:line-through"

            checkboxProps.checked = true
        }

        return h("li",
        [
            h("label",
            [
                h("input", checkboxProps),
                h("span")
            ]),
            h("input", inputProps)
        ]) 
    }
}