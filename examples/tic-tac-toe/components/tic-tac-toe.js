import Field from "./field.js"

const h = IG.createElement

export default class TicTacToe extends IG.Component
{
    constructor()
    {
        super({ key: "tictactoe" })
    }

    onBeforeMount()
    {
        this.setState(
        {
            fieldState: [],
            xIsNext: Math.random() > 0.5
        })

        this.loadState()

        const winner = this.checkWinner()
        
        if (winner)
        {
            this.setState("fieldState", [])
        }
    }

    checkWinner()
    {
        const s = this.state.fieldState

        if (!s) return

        if (s[0] && s[0] == s[1] && s[1] == s[2]) return s[0] = s[1] = s[2] = s[0][0] + "-"
        if (s[3] && s[3] == s[4] && s[4] == s[5]) return s[3] = s[4] = s[5] = s[3][0] + "-"
        if (s[6] && s[6] == s[7] && s[7] == s[8]) return s[6] = s[7] = s[8] = s[6][0] + "-"

        if (s[0] && s[0] == s[3] && s[3] == s[6]) return s[0] = s[3] = s[6] = s[0][0] + "-"
        if (s[1] && s[1] == s[4] && s[4] == s[7]) return s[1] = s[4] = s[7] = s[1][0] + "-"
        if (s[2] && s[2] == s[5] && s[5] == s[8]) return s[2] = s[5] = s[8] = s[2][0] + "-"

        if (s[0] && s[0] == s[4] && s[4] == s[8]) return s[0] = s[4] = s[8] = s[0][0] + "-"
        if (s[2] && s[2] == s[4] && s[4] == s[6]) return s[2] = s[4] = s[6] = s[2][0] + "-"

        if (s.filter(v => v).length == 9) return "draw"
    }
    
    render()
    {
        const winner = this.checkWinner()
        const rows = []

        this.saveState()

        for (let y = 0; y < 3; y++)
        {
            const fields = []
            
            for (let x = 0; x < 3; x++)
            {
                const i = y*3+x

                fields.push(new Field(
                {
                    state: this.state.fieldState[i] || 0,

                    onClick: () =>
                    {
                        if (winner || this.state.fieldState[i])
                        {
                            return
                        }

                        this.state.fieldState[i] = this.state.xIsNext ? "o" : "x"

                        this.setState(
                        {
                            fieldState: this.state.fieldState,
                            xIsNext: !this.state.xIsNext 
                        })
                    }
                }))
            }

            rows.push(h("div", { class: "row" }, fields))
        }

        return h("div", { class: "tic-tac-toe" },
        [
            h("h1", "TicTacToe"),
            h("div", { class: "status" },
            [ winner
                ? winner == "draw" ? "- DRAW - " : "– GAME OVER –"
                : "Current Turn: " + (this.state.xIsNext ? "O" : "X")
            ]),
            h("div", { class: "fields" }, rows)
        ])
    }
}