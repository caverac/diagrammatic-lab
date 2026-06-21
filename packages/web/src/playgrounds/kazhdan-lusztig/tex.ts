/** Kazhdan-Lusztig-specific LaTeX fragments, rendered by the shared `<Math>`. */

/**
 * LaTeX for a polynomial given its integer coefficients (`p[i]` is the
 * coefficient of `q^i`), e.g. `[1, 2, 1] -> "1 + 2q + q^{2}"`. The zero and
 * empty polynomials render as `0`.
 */
export function polynomialTex(p: readonly number[]): string {
  const terms: string[] = []
  p.forEach((coefficient, power) => {
    if (coefficient === 0) {
      return
    }
    if (power === 0) {
      terms.push(`${coefficient}`)
      return
    }
    const factor = coefficient === 1 ? '' : `${coefficient}`
    terms.push(power === 1 ? `${factor}q` : `${factor}q^{${power}}`)
  })
  return terms.length === 0 ? '0' : terms.join(' + ')
}
