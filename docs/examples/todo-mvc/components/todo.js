import YARC from "../../../../lib/index.js"
import Task from "./task.js"

const h = YARC.createElement

export default class extends YARC.Component
{
    constructor()
    {
        super()

        this.state.tasks = []
        this.loadState("todo-mvc")
    }

    onInput(e)
    {
        if (e.keyCode != 13 || !e.target.value) return

        const tasks = this.state.tasks

        tasks.push({ value: e.target.value })

        e.target.value = ""

        this.update()
        this.saveState("todo-mvc")
    }

    onTaskToggle(task, state)
    {
        task.checked = state.checked
        this.saveState("todo-mvc")
    }

    onTaskInput(task, state)
    {
        task.value = state.value
        this.saveState("todo-mvc")
    }

    onTaskDelete(task)
    {
        const index = this.state.tasks.indexOf(task)

        console.log("foo")
        if (index != -1)
        {
            this.state.tasks.splice(index,1)
        }

        this.saveState("todo-mvc")
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
                task.onUnmount = state => this.onTaskDelete(task)

                return new Task(task)
            }))
        ])
    }
}