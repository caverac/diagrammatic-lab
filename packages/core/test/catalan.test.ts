import { catalan, diagramKey, enumerateBasis, isValidTLDiagram } from '@core/.'

describe('catalan', () => {
  it('matches the known Catalan sequence', () => {
    expect([0, 1, 2, 3, 4, 5].map(catalan)).toEqual([1, 1, 2, 5, 14, 42])
  })

  it('rejects invalid arguments', () => {
    expect(() => catalan(-1)).toThrow(RangeError)
    expect(() => catalan(1.5)).toThrow(RangeError)
  })
})

describe('enumerateBasis', () => {
  it('produces exactly C_n basis diagrams for each rank', () => {
    for (let n = 0; n <= 4; n += 1) {
      expect(enumerateBasis(n)).toHaveLength(catalan(n))
    }
  })

  it('produces only valid, distinct diagrams', () => {
    const basis = enumerateBasis(4)
    expect(basis.every(isValidTLDiagram)).toBe(true)
    const keys = new Set(basis.map(diagramKey))
    expect(keys.size).toBe(basis.length)
  })

  it('rejects invalid arguments', () => {
    expect(() => enumerateBasis(-1)).toThrow(RangeError)
    expect(() => enumerateBasis(2.5)).toThrow(RangeError)
  })
})
