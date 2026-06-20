#!/usr/bin/env node
/**
 * Guard against non-ASCII characters in source files.
 *
 * Any byte above U+007F fails the check, printing every offending location as
 * `file:line:col  U+XXXX 'c'`. With file paths as arguments it checks exactly
 * those (the lint-staged entry point); with no arguments it scans every tracked
 * source file via `git ls-files` (the `yarn check:ascii` entry point).
 *
 * Documentation (Markdown, notebooks) is intentionally out of scope: it carries
 * deliberate mathematical typography. This guard covers code only.
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const CODE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'css', 'json', 'yml', 'yaml']
const EXTENSION_PATTERN = new RegExp(`\\.(${CODE_EXTENSIONS.join('|')})$`)

/** The source files to scan: the given arguments, or all tracked code files. */
function filesToCheck() {
  const args = process.argv.slice(2)
  if (args.length > 0) {
    return args.filter((file) => EXTENSION_PATTERN.test(file))
  }
  return execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter((file) => file !== '' && EXTENSION_PATTERN.test(file))
}

/** Collect every non-ASCII character in a file as `{ line, col, char }`. */
function findNonAscii(contents) {
  const offenders = []
  const lines = contents.split('\n')
  for (let row = 0; row < lines.length; row += 1) {
    const line = lines[row]
    for (let col = 0; col < line.length; col += 1) {
      if (line.codePointAt(col) > 0x7f) {
        offenders.push({ line: row + 1, col: col + 1, char: line[col] })
      }
    }
  }
  return offenders
}

let total = 0
for (const file of filesToCheck()) {
  const offenders = findNonAscii(readFileSync(file, 'utf8'))
  for (const { line, col, char } of offenders) {
    const code = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
    console.error(`${file}:${line}:${col}  U+${code} ${JSON.stringify(char)}`)
  }
  total += offenders.length
}

if (total > 0) {
  console.error(`\nFound ${total} non-ASCII character(s). Source files must be pure ASCII.`)
  process.exit(1)
}
