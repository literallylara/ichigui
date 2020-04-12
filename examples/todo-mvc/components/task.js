const h = YARC.createElement

export default class extends YARC.Component
{
    constructor(props)
    {
        super(props)
    }

    render()
    {
        const checked = this.props.checked

        return h("li",
        [
            h("label",
            [
                h("input",
                {
                    type: "checkbox",
                    input: e =>
                    {
                        this.props.onToggle && this.props.onToggle(e.target.checked)
                    },
                    checked: checked ? true : undefined,
                }),
                h("span")
            ]),
            h("input",
            {
                type: "text",
                input: e =>
                {
                    this.props.onInput && this.props.onInput(e.target.value)
                },
                value: this.props.value,
                readonly: checked ? true : undefined,
                style: checked ? "text-decoration:line-through": undefined
            }),
            h("span",
            {
                class: "delete",
                click: () =>
                {
                    this.unmount()
                    this.props.onDelete && this.props.onDelete()
                }
            })
        ]) 
    }
}