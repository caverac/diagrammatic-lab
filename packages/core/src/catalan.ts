/**
 * Catalan combinatorics for the Temperley–Lieb basis.
 *
 * The number of `TL_n` basis diagrams equals the `n`-th Catalan number
 * `C_n = (1/(n+1)) · C(2n, n)`, because both count non-crossing perfect
 * matchings of `2n` points on a line. {@link enumerateBasis} generates them
 * all, and the test suite checks that the count agrees with {@link catalan}.
 */

import { diagram, fromBoundaryIndex, type Arc, type TLDiagram } from './diagram'

/** The `n`-th Catalan number, via the recurrence `C_{n+1} = Σ C_i C_{n-i}`. */
export function catalan(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`catalan expects a non-negative integer, got ${n}`)
  }
  const c = [1]
  for (let k = 1; k <= n; k += 1) {
    let total = 0
    for (let i = 0; i < k; i += 1) {
      total += c[i] * c[k - 1 - i]
    }
    c[k] = total
  }
  return c[n]
}

/**
 * All non-crossing perfect matchings of the boundary indices `seq`, returned as
 * lists of index pairs. The first point `seq[0]` is matched to some later point
 * `seq[j]` with `j` odd, so that the arc splits the rest into two even runs that
 * are themselves matched non-crossingly — the standard Catalan recursion.
 */
function nonCrossingMatchings(seq: readonly number[]): Array<Array<[number, number]>> {
  if (seq.length === 0) {
    return [[]]
  }
  const [head, ...rest] = seq
  const results: Array<Array<[number, number]>> = []
  for (let j = 0; j < rest.length; j += 2) {
    const partner = rest[j]
    const inside = rest.slice(0, j)
    const outside = rest.slice(j + 1)
    for (const insideMatch of nonCrossingMatchings(inside)) {
      for (const outsideMatch of nonCrossingMatchings(outside)) {
        results.push([[head, partner], ...insideMatch, ...outsideMatch])
      }
    }
  }
  return results
}

/**
 * Enumerate every basis diagram of `TL_n`. The result has length `catalan(n)`
 * and contains each diagram exactly once.
 */
export function enumerateBasis(n: number): TLDiagram[] {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`enumerateBasis expects a non-negative integer, got ${n}`)
  }
  const boundary = Array.from({ length: 2 * n }, (_, i) => i)
  return nonCrossingMatchings(boundary).map((matching) => {
    const arcs: Arc[] = matching.map(([a, b]) => [fromBoundaryIndex(n, a), fromBoundaryIndex(n, b)])
    return diagram(n, arcs)
  })
}
