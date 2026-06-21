/** Coxeter-specific LaTeX fragments, rendered by the shared `<Math>`. */

/** LaTeX for the generator `s_i`, displayed 1-indexed. */
export function generatorTex(i: number): string {
  return `s_{${i + 1}}`
}

/** LaTeX for a reduced word as a product of generators, or `e` when empty. */
export function reducedWordTex(word: readonly number[]): string {
  if (word.length === 0) {
    return 'e'
  }
  return word.map((i) => generatorTex(i)).join('')
}
