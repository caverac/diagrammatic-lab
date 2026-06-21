/** Rewriting-specific LaTeX fragments, rendered by the shared `<Math>`. */

import { type Move } from '@diagrammatic-lab/core'

/** A word of generators as LaTeX, e.g. `[1, 0, 1] -> "e_{2}e_{1}e_{2}"`; empty is `1`. */
export function wordTex(word: readonly number[]): string {
  if (word.length === 0) {
    return '1'
  }
  return word.map((i) => `e_{${i + 1}}`).join('')
}

/** The delta coefficient of a power: `''`, `\delta`, or `\delta^{k}`. */
export function deltaPowerTex(power: number): string {
  if (power === 0) {
    return ''
  }
  if (power === 1) {
    return '\\delta'
  }
  return `\\delta^{${power}}`
}

/** A short LaTeX label for the relation a move applies, at 1-indexed generators. */
export function moveTex(move: Move, word: readonly number[]): string {
  const a = word[move.at] + 1
  if (move.kind === 'loop') {
    return `e_{${a}}e_{${a}} = \\delta\\, e_{${a}}`
  }
  const b = word[move.at + 1] + 1
  if (move.kind === 'contract') {
    return `e_{${a}}e_{${b}}e_{${a}} = e_{${a}}`
  }
  return `e_{${a}}e_{${b}} = e_{${b}}e_{${a}}`
}
