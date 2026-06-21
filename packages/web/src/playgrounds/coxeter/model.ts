/**
 * The framework-independent view-model for the Coxeter playground.
 *
 * The symmetric group S_n is the Coxeter group of type A_{n-1}: it is generated
 * by the adjacent transpositions s_1, ..., s_{n-1}, where s_i swaps positions i
 * and i+1. This module computes the basic Coxeter data for small S_n -
 * permutations, length (= number of inversions), reduced words, and the Bruhat
 * order - as pure data, so the React layer stays thin and every line is tested.
 *
 * Permutations are stored 0-indexed: a `Permutation` p of size n is an array
 * with `p[i]` the image of position i, the entries being a rearrangement of
 * 0..n-1. One-line notation is displayed 1-indexed.
 */

/** A permutation in one-line notation, 0-indexed. */
export type Permutation = readonly number[]

/** The identity permutation of S_n. */
export function identityPermutation(n: number): Permutation {
  return Array.from({ length: n }, (_, i) => i)
}

/** One-line notation as a 1-indexed string, e.g. `[1,0,2] -> "213"`. */
export function oneLine(p: Permutation): string {
  return p.map((value) => value + 1).join('')
}

/** Whether a permutation is the identity. */
export function isIdentityPermutation(p: Permutation): boolean {
  return p.every((value, i) => value === i)
}

/** The Coxeter length of `p`: the number of inversions `#{i < j : p[i] > p[j]}`. */
export function permLength(p: Permutation): number {
  let count = 0
  for (let i = 0; i < p.length; i += 1) {
    for (let j = i + 1; j < p.length; j += 1) {
      if (p[i] > p[j]) {
        count += 1
      }
    }
  }
  return count
}

/** The right descents of `p`: positions `i` with `p[i] > p[i+1]`. */
export function descents(p: Permutation): number[] {
  const result: number[] = []
  for (let i = 0; i + 1 < p.length; i += 1) {
    if (p[i] > p[i + 1]) {
      result.push(i)
    }
  }
  return result
}

/**
 * Right-multiply by the generator `s_i`: swap the entries in positions `i` and
 * `i+1`. This raises length by one when `i` is an ascent, lowers it when `i` is
 * a descent.
 */
export function timesGenerator(p: Permutation, i: number): Permutation {
  const next = p.slice()
  ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
  return next
}

/** Every permutation of S_n, in lexicographic order. */
export function symmetricGroup(n: number): Permutation[] {
  const result: Permutation[] = []
  const used = new Array<boolean>(n).fill(false)
  const current: number[] = []
  const recurse = (): void => {
    if (current.length === n) {
      result.push(current.slice())
      return
    }
    for (let value = 0; value < n; value += 1) {
      if (!used[value]) {
        used[value] = true
        current.push(value)
        recurse()
        current.pop()
        used[value] = false
      }
    }
  }
  recurse()
  return result
}

/**
 * A reduced word for `p`: a shortest sequence of generator indices whose product
 * is `p`. Found by peeling off a right descent at a time, which lowers the
 * length by one until the identity remains.
 */
export function reducedWord(p: Permutation): number[] {
  let w = p
  const word: number[] = []
  while (!isIdentityPermutation(w)) {
    const i = descents(w)[0]
    word.push(i)
    w = timesGenerator(w, i)
  }
  return word.reverse()
}

/**
 * The number of reduced words of `p`: the number of maximal chains down to the
 * identity in the right weak order, summed over the descents at each step.
 */
export function numReducedWords(p: Permutation): number {
  const memo = new Map<string, number>()
  const recurse = (w: Permutation): number => {
    if (isIdentityPermutation(w)) {
      return 1
    }
    const key = w.join(',')
    const cached = memo.get(key)
    if (cached !== undefined) {
      return cached
    }
    let total = 0
    for (const i of descents(w)) {
      total += recurse(timesGenerator(w, i))
    }
    memo.set(key, total)
    return total
  }
  return recurse(p)
}

/** The longest element `w_0` of S_n: the reversal, of length `n(n-1)/2`. */
export function longestElement(n: number): Permutation {
  return Array.from({ length: n }, (_, i) => n - 1 - i)
}

/** The top-left rank `#{a <= i : p[a] <= j}` of the permutation matrix. */
function rank(p: Permutation, i: number, j: number): number {
  let count = 0
  for (let a = 0; a <= i; a += 1) {
    if (p[a] <= j) {
      count += 1
    }
  }
  return count
}

/**
 * The Bruhat order: `u <= w` iff the top-left ranks satisfy
 * `rank(u, i, j) >= rank(w, i, j)` for all `i, j` (the Ehresmann criterion). The
 * identity is the minimum; the longest element `w_0` is the maximum.
 */
export function bruhatLeq(u: Permutation, w: Permutation): boolean {
  const n = u.length
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (rank(u, i, j) < rank(w, i, j)) {
        return false
      }
    }
  }
  return true
}

/** A node of the Bruhat Hasse diagram, with a normalized layout position. */
export interface BruhatNode {
  readonly perm: Permutation
  readonly length: number
  /** Horizontal position within the rank, in `(0, 1)`. */
  readonly x: number
  /** Vertical position by rank, in `[0, 1]`; the identity is at `0`. */
  readonly y: number
}

/** The Bruhat Hasse diagram of S_n: ranked nodes and covering edges. */
export interface BruhatGraph {
  readonly nodes: readonly BruhatNode[]
  /** Covering relations as `[lowerIndex, upperIndex]` pairs into `nodes`. */
  readonly edges: readonly [number, number][]
  readonly maxLength: number
}

/**
 * Build the Bruhat order of S_n as a laid-out Hasse diagram. Nodes are ranked by
 * length; an edge joins `u` to `w` exactly when `u <= w` and `w` has length one
 * greater (Bruhat order is graded by length, so these are the covers).
 */
export function bruhatGraph(n: number): BruhatGraph {
  const perms = symmetricGroup(n)
  const maxLength = (n * (n - 1)) / 2

  const byLength = new Map<number, number[]>()
  const lengths = perms.map(permLength)
  perms.forEach((_, index) => {
    const length = lengths[index]
    const bucket = byLength.get(length)
    if (bucket === undefined) {
      byLength.set(length, [index])
    } else {
      bucket.push(index)
    }
  })

  const nodes: BruhatNode[] = perms.map((perm, index) => {
    const length = lengths[index]
    const rankMembers = byLength.get(length) as number[]
    const position = rankMembers.indexOf(index)
    return {
      perm,
      length,
      x: (position + 1) / (rankMembers.length + 1),
      y: length / maxLength
    }
  })

  const edges: [number, number][] = []
  for (let lower = 0; lower < perms.length; lower += 1) {
    for (let upper = 0; upper < perms.length; upper += 1) {
      if (lengths[upper] === lengths[lower] + 1 && bruhatLeq(perms[lower], perms[upper])) {
        edges.push([lower, upper])
      }
    }
  }

  return { nodes, edges, maxLength }
}
