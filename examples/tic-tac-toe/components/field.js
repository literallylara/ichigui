const h = IG.createElement

export default class Field extends IG.Component
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