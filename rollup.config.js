import babel from "rollup-plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import minify from "rollup-plugin-babel-minify"

export default
{
    input: "./lib/index.js",
    
    output:
    {
        file: "./dist/gui.min.js",
        format: "iife",
        name: "GUI"
    },

    plugins:
    [
        babel(),
        resolve(),
        commonjs(),
        minify({ comments: false, sourceMap: false })
    ]
}
