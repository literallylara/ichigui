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
        super()

        this.state.tasks = []
        this.loadState("todo-mvc")
        this.updateLastSaved()

        window.setInterval(() => this.updateLastSaved(), 1000)
    }

    onInput(e)
    {
        if (e.keyCode != 13 || !e.target.value) return

        const tasks = this.state.tasks

        tasks.push({ value: e.target.value })

        e.target.value = ""

        this.update()
        this.save()
    }

    onTaskToggle(task, state)
    {
        task.checked = state.checked
        this.save()
    }

    onTaskInput(task, state)
    {
        task.value = state.value
        this.save()
    }

    onTaskDelete(task, state)
    {
        const index = this.state.tasks.indexOf(task)
 
        if (index != -1)
        {
            this.state.tasks.splice(index,1)
        }

        this.setState("tasks", this.state.tasks)
        this.save()
    }

    save()
    {
        this.setState("lastSaved", Date.now())
        this.updateLastSaved()

        this.saveState("todo-mvc")
    }

    updateLastSaved()
    {
        this.setState("lastSavedString", getDateString(this.state.lastSaved))
    }

    render()
    {
        return h("todos",
        [
            h("h1", ["todos"]),
            h("input",
            {
                type: "text",
                placeholder: "What needs to be done?",
                keydown: e => this.onInput(e)
            }),
            h("ul", this.state.tasks.map(task =>
            {
                task.onInput = state => this.onTaskInput(task, state)
                task.onToggle = state => this.onTaskToggle(task, state)
                task.onDelete = state => this.onTaskDelete(task, state)

                return new Task(task)
            })),
            h("div", { class: "status" },
            [
                this.state.lastSavedString
                ? `Saved: ${this.state.lastSavedString}`
                : ""
            ])
        ])
    }
}