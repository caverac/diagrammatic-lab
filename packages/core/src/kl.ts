/**
 * Kazhdan-Lusztig polynomials for the symmetric group S_n.
 *
 * For x <= y in the Bruhat order, P_{x,y}(q) is a polynomial in q with
 * non-negative integer coefficients, computed here by the Bjorner-Brenti
 * recursion (Combinatorics of Coxeter Groups, Thm 5.1.8) using right descents,
 * which matches the right-multiplication convention of the Coxeter engine.
 *
 * Geometrically P_{e,w}(q) measures the singularity of the Schubert variety
 * X_w: it equals 1 exactly when X_w is rationally smooth. The smallest singular
 * examples in type A are w = 4231 and w = 3412 in S_4, both with P_{e,w} = 1 + q.
 */

import {
  bruhatLeq,
  descents,
  permLength,
  symmetricGroup,
  timesGenerator,
  type Permutation
} from '@core/coxeter'

/**
 * A polynomial in q, as the list of integer coefficients with `p[i]` the
 * coefficient of `q^i`. The zero polynomial is `[]`; trailing zeros are trimmed.
 */
export type Polynomial = readonly number[]

/** Drop trailing zero coefficients so equal polynomials have equal arrays. */
function trim(p: readonly number[]): Polynomial {
  let length = p.length
  while (length > 0 && p[length - 1] === 0) {
    length -= 1
  }
  return p.slice(0, length)
}

/** Sum of two polynomials. */
function add(a: Polynomial, b: Polynomial): number[] {
  const out = new Array<number>(Math.max(a.length, b.length)).fill(0)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = (a[i] ?? 0) + (b[i] ?? 0)
  }
  return out
}

/** Multiply a polynomial by `q^shift`. */
function shiftBy(p: Polynomial, shift: number): number[] {
  if (p.length === 0) {
    return []
  }
  return [...new Array<number>(shift).fill(0), ...p]
}

/** Compute `acc - scale * q^shift * p`. */
function subtractScaled(acc: number[], scale: number, shift: number, p: Polynomial): number[] {
  const out = new Array<number>(Math.max(acc.length, shift + p.length)).fill(0)
  for (let i = 0; i < acc.length; i += 1) {
    out[i] = acc[i]
  }
  for (let i = 0; i < p.length; i += 1) {
    out[i + shift] -= scale * p[i]
  }
  return out
}

/** Whether two permutations are equal. */
function samePermutation(a: Permutation, b: Permutation): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i])
}

/** A reusable Kazhdan-Lusztig calculator for a fixed rank `n`. */
export interface KLContext {
  /** The Kazhdan-Lusztig polynomial `P_{x,y}(q)` (zero `[]` when `x` is not `<= y`). */
  readonly polynomial: (x: Permutation, y: Permutation) => Polynomial
}

/**
 * Build a Kazhdan-Lusztig calculator for S_n. The whole group is enumerated
 * once and results are memoized, so computing a full interval is cheap.
 */
export function createKLContext(n: number): KLContext {
  const perms = symmetricGroup(n)
  const memo = new Map<string, Polynomial>()
  const key = (x: Permutation, y: Permutation): string => `${x.join(',')}>${y.join(',')}`

  function polynomial(x: Permutation, y: Permutation): Polynomial {
    if (samePermutation(x, y)) {
      return [1]
    }
    if (!bruhatLeq(x, y)) {
      return []
    }
    const cacheKey = key(x, y)
    const cached = memo.get(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    const s = descents(y)[0] // any right descent of y works; take the first.
    const v = timesGenerator(y, s) // ys < y, length one less.
    const c = descents(x).includes(s) ? 1 : 0 // c = 1 iff xs < x.
    const xs = timesGenerator(x, s)
    const lengthY = permLength(y)

    let result = add(shiftBy(polynomial(xs, v), 1 - c), shiftBy(polynomial(x, v), c))

    for (const z of perms) {
      if (samePermutation(z, v) || !bruhatLeq(x, z) || !bruhatLeq(z, v)) {
        continue // need x <= z < v.
      }
      if (!descents(z).includes(s)) {
        continue // need zs < z.
      }
      const mu = muCoefficient(z, v)
      if (mu !== 0) {
        const power = (lengthY - permLength(z)) / 2
        result = subtractScaled(result, mu, power, polynomial(x, z))
      }
    }

    const trimmed = trim(result)
    memo.set(cacheKey, trimmed)
    return trimmed
  }

  /** The coefficient mu(z, v): the top coefficient of `P_{z,v}` when defined. */
  function muCoefficient(z: Permutation, v: Permutation): number {
    const gap = permLength(v) - permLength(z)
    if (gap <= 0 || gap % 2 === 0) {
      return 0
    }
    return polynomial(z, v)[(gap - 1) / 2] ?? 0
  }

  return { polynomial }
}

/** The Kazhdan-Lusztig polynomial `P_{x,y}(q)` for a single pair. */
export function klPolynomial(x: Permutation, y: Permutation): Polynomial {
  return createKLContext(x.length).polynomial(x, y)
}
