import { longestElement, permLength, symmetricGroup, type Permutation } from '@core/coxeter'
import { createKLContext, klPolynomial, type Polynomial } from '@core/kl'

// One-line notation (1-indexed) to a 0-indexed permutation.
function perm(...oneLine: number[]): Permutation {
  return oneLine.map((value) => value - 1)
}

describe('Kazhdan-Lusztig polynomials', () => {
  it('is 1 on the diagonal and 0 off the Bruhat order', () => {
    const kl = createKLContext(3)
    expect(kl.polynomial(perm(1, 2, 3), perm(1, 2, 3))).toEqual([1])
    // The two simple reflections are Bruhat-incomparable.
    expect(kl.polynomial(perm(2, 1, 3), perm(1, 3, 2))).toEqual([])
  })

  it('is trivial whenever the length gap is at most two', () => {
    const kl = createKLContext(4)
    for (const y of symmetricGroup(4)) {
      for (const x of symmetricGroup(4)) {
        const p = kl.polynomial(x, y)
        if (p.length > 0 && permLength(y) - permLength(x) <= 2) {
          expect(p).toEqual([1])
        }
      }
    }
  })

  it('detects the singular Schubert varieties 4231 and 3412 with P_{e,w} = 1 + q', () => {
    const kl = createKLContext(4)
    const e = perm(1, 2, 3, 4)
    expect(kl.polynomial(e, perm(4, 2, 3, 1))).toEqual([1, 1])
    expect(kl.polynomial(e, perm(3, 4, 1, 2))).toEqual([1, 1])
  })

  it('keeps the full flag variety smooth: P_{e, w_0} = 1', () => {
    const kl = createKLContext(4)
    expect(kl.polynomial(perm(1, 2, 3, 4), longestElement(4))).toEqual([1])
  })

  it('obeys non-negativity and the degree bound deg P <= (l(y)-l(x)-1)/2', () => {
    const kl = createKLContext(4)
    const elements = symmetricGroup(4)
    for (const y of elements) {
      for (const x of elements) {
        const p: Polynomial = kl.polynomial(x, y)
        if (p.length === 0) {
          continue
        }
        expect(p.every((coefficient) => coefficient >= 0)).toBe(true)
        if (permLength(y) > permLength(x)) {
          expect(p.length - 1).toBeLessThanOrEqual((permLength(y) - permLength(x) - 1) / 2)
        }
      }
    }
  })

  it('agrees with the standalone helper', () => {
    expect(klPolynomial(perm(1, 2, 3, 4), perm(4, 2, 3, 1))).toEqual([1, 1])
  })
})
