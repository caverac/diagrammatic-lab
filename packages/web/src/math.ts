/**
 * LaTeX typesetting via KaTeX, kept as pure functions so they are unit-tested
 * without a DOM (`katex.renderToString` produces an HTML string directly).
 */

import katex from 'katex'

/** Render a LaTeX string to KaTeX HTML. Invalid input renders in error color
 *  rather than throwing, so a typo never blanks the page. */
export function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode })
}

/** A run of prose or a run of inline LaTeX, parsed from a `$...$` string. */
export type InlineSegment =
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'math'; readonly value: string }

/**
 * Split a string into alternating text / inline-math segments on `$` delimiters,
 * e.g. `"in $S_n$"` -> `[text "in ", math "S_n"]`. Empty runs are dropped.
 */
export function parseInlineMath(text: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  text.split('$').forEach((value, index) => {
    if (value.length === 0) {
      return
    }
    segments.push(index % 2 === 1 ? { type: 'math', value } : { type: 'text', value })
  })
  return segments
}
