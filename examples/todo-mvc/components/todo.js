import Task from "./task.js"

const h = IG.createElement

function leftPadDigit(n)
{
    return n < 10 ? "0"+n : n
}

function getDateString(date)
{
    const d = (Date.now()-date)/1000

    if (d < 5)
    {
        return "just now"
    }
    if (d < 60)
    {
        return Math.round(d) + " seconds ago"
    }
    else if (d < 60*60)
    {
        return Math.round(d/60) + " minutes ago"
    }
    else if (d < 60*60*12)
    {
        return Math.round(d/60/60) + " hours ago"
    }
    else
    {
        const d = new Date(date)
    
        const DD = d.getDate()
        const MM = leftPadDigit(d.getMonth()+1)
        const YY = leftPadDigit(d.getFullYear())
        const hh = leftPadDigit(d.getHours())
        const mm = leftPadDigit(d.getMinutes())
        const ss = leftPadDigit(d.getSeconds())
    
        return `${YY}-${MM}-${DD} ${hh}:${mm}:${ss}`
    }
}

export default class ToDo extends IG.Component
{
    constructor()
    {
        super({ key: "todo-mvc" })

        this.state.tasks = []
        this.loadState()

        this.updateLastSaved()
        window.setInterval(() => this.updateLastSaved(), 1000)
    }

    onInput(e)
    {
        if (e.keyCode != 13 || !e.target.value) return

        const tasks = this.state.tasks

        tasks.push({ key: IG.uuid(), value: e.target.value })

        e.target.value = ""

        this.update()
        this.save()
    }

    save()
    {
        this.setState(
        {
            tasks: this.state.tasks,
            lastSaved: Date.now()
        })

        this.updateLastSaved()
        this.saveState()
    }

    updateLastSaved()
    {
        if (!this.state.lastSaved) return

        const str = getDateString(this.state.lastSaved)

        this.setState("lastSavedString", "Saved: " + str)
    }

    render()
    {
        return h("todo",
        [
            h("h1", ["todos"]),
            h("input",
            {
                type: "text",
                placeholder: "What needs to be done?",
                keydown: e => this.onInput(e)
            }),
            h("ul", this.state.tasks.map((props, i) =>
            {
                return new Task(Object.assign(
                {
                    onDelete: () =>
                    {
                        this.state.tasks.splice(i, 1)
                        this.save()
                    },
                    onInput: v =>
                    {
                        props.value = v
                        this.save()
                    },
                    onToggle: v =>
                    {
                        props.checked = v
                        this.save()
                    }
                }, props))
            })),
            h("div", { class: "status" }, [this.state.lastSavedString || ""])
        ])
    }
}