import Task from "./task.js"

const h = YARC.createElement

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

export default class extends YARC.Component
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

        tasks.push({ key: YARC.uuid(), value: e.target.value })

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
        this.saveState("todo-mvc")
    }

    updateLastSaved()
    {
        if (!this.state.lastSaved) return

        const str = getDateString(this.state.lastSaved)

        this.setState("lastSavedString", "Saved: " + str)
    }

    render()
    {
        const tasks = this.state.tasks.map((props, i) =>
        {
            const task = new Task(props)

            task.loadState()

            task.onUnmount = () =>
            {
                this.state.tasks.splice(i, 1)
                this.save()
            }

            return task
        })

        return h("todos",
        [
            h("h1", ["todos"]),
            h("input",
            {
                type: "text",
                placeholder: "What needs to be done?",
                keydown: e => this.onInput(e)
            }),
            h("ul", tasks),
            h("div", { class: "status" }, [this.state.lastSavedString || ""])
        ])
    }
}