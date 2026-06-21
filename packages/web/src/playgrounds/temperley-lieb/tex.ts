/** Temperley-Lieb-specific LaTeX fragments, rendered by the shared `<Math>`. */

/** The `delta` coefficient of a product, as LaTeX: `''`, `\delta`, or `\delta^{17}`. */
export function coefficientTex(loops: number): string {
  if (loops === 0) {
    return ''
  }
  if (loops === 1) {
    return '\\delta'
  }
  return `\\delta^{${loops}}`
}

/** LaTeX for the algebra `TL_n(delta)`. */
export function temperleyLiebTex(rank: number): string {
  return `\\mathrm{TL}_{${rank}}(\\delta)`
}
