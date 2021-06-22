import fs from "fs"
import {join, normalize} from "path"
import chalk from "chalk"

const build_dir = normalize(`${__dirname}/../..`) // build/test/codebase -> build

const LIMITS = new Map([
  // es2017
  ["js/bokeh.min.js",                 950],
  ["js/bokeh-widgets.min.js",         300],
  ["js/bokeh-tables.min.js",          350],
  ["js/bokeh-api.min.js",             100],
  ["js/bokeh-gl.min.js",                0],
  // legacy (es5)
  ["js/bokeh.legacy.min.js",         1200],
  ["js/bokeh-widgets.legacy.min.js",  350],
  ["js/bokeh-tables.legacy.min.js",   350],
  ["js/bokeh-api.legacy.min.js",      110],
  ["js/bokeh-gl.legacy.min.js",         0],
])

const n = Math.max(...[...LIMITS.keys()].map((l) => l.length))

function pad(value: unknown): string {
  const str = `${value}`
  const pre = " ".repeat(4 - str.length)
  return `${pre}${str}`
}

let failures = 0
for (const [filename, limit] of LIMITS) {
  const path = join(build_dir, filename)
  const stats = fs.existsSync(path) ? fs.statSync(path) : null

  const ok = stats != null && stats.size <= limit*1024
  if (!ok) failures++
  const prefix = ok ? chalk.green("\u2713") : chalk.red("\u2717")
  const op = ok ? "<=" : "> "
  const padding = " ".repeat(n - filename.length + 1)
  const size = stats != null ? Math.round(stats.size/1024) : "???"

  console.log(` ${prefix} ${chalk.gray(filename)}${padding}${chalk.magenta(pad(size))} kB ${op} ${pad(limit)} kB`)
}

process.exit(failures == 0 ? 0 : 1)
