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
