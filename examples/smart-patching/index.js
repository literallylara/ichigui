const h = IG.createElement

const shuffle = a =>
{
    for (let i = a.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
}

class Debug extends IG.Component
{
    constructor()
    {
        super()

        window.setInterval(() => this.update(), 1000)
    }

    render()
    {
        const children_a = []

        for (let i = 0; i < 6; i++)
        {
            children_a.push(h("li", { key: i }, [h("span", [i.toString()])]))
        }

        shuffle(children_a)

        const children_b = children_a.map(v => h("li", v.children.slice(0)))

        return h("div", { class: "container" },
        [
            h("div", { class: "column" },
            [
                h("h3", ["With keys"]),
                h("ul", children_a)
            ]),
            h("div", { class: "column" },
            [
                h("h3", ["Without keys"]),
                h("ul", children_b)
            ])
        ])
    }
}

new Debug().mount(document.getElementById("root"))