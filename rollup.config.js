import babel from "rollup-plugin-babel"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import minify from "rollup-plugin-babel-minify"

import pkg from "./package.json"

const banner = `/**!
 * ${pkg.name} v${pkg.version}
 * License: ${pkg.license}
 * ${pkg.homepage}
 */`

export default
[{
    input: "./lib/index.js",
    
    output:
    {
        file: `./dist/${pkg.name}.min.es5.js`,
        format: "iife",
        name: "IG",
        banner
    },

    plugins:
    [
        babel(),
        resolve(),
        commonjs(),
        minify({ comments: false })
    ]
},{
    input: "./lib/index.js",
    
    output:
    {
        file: `./dist/${pkg.name}.min.js`,
        format: "iife",
        name: "IG",
        banner
    },

    plugins:
    [
        minify({ comments: false })
    ]
}]