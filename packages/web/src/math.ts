/**
 * LaTeX typesetting via KaTeX, kept as pure functions so they are unit-tested
 * without a DOM (`katex.renderToString` produces an HTML string directly).
 */

import katex from 'katex'

/** Render a LaTeX string to KaTeX HTML. Invalid input renders in error colour
 *  rather than throwing, so a typo never blanks the page. */
export function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode })
}

/** The `δ` coefficient of a product, as LaTeX: `''`, `\delta`, or `\delta^{k}`. */
export function coefficientTex(loops: number): string {
  if (loops === 0) {
    return ''
  }
  if (loops === 1) {
    return '\\delta'
  }
  return `\\delta^{${loops}}`
}

/** LaTeX for the algebra `TL_n(δ)`. */
export function temperleyLiebTex(rank: number): string {
  return `\\mathrm{TL}_{${rank}}(\\delta)`
}
