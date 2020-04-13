const h = YARC.createElement

export default class Field extends YARC.Component
{
    constructor(props)
    {
        super(props)
    }

    render()
    {
        return h("div",
        {
            click:() => this.props.onClick && this.props.onClick(),
            class: "field state-" + this.props.state
        })
    }
}