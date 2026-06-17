import { diagramEquals, generator, identity, multiply, type TLDiagram } from '../src'

/** Helper: chain a left-to-right product, accumulating the loop count. */
function product(first: TLDiagram, ...rest: TLDiagram[]): { loops: number; diagram: TLDiagram } {
  return rest.reduce(
    (acc, next) => {
      const step = multiply(acc.diagram, next)
      return { loops: acc.loops + step.loops, diagram: step.diagram }
    },
    { loops: 0, diagram: first }
  )
}

describe('multiply', () => {
  it('treats the identity as a unit', () => {
    const e0 = generator(3, 0)
    const left = multiply(identity(3), e0)
    const right = multiply(e0, identity(3))
    expect(left.loops).toBe(0)
    expect(diagramEquals(left.diagram, e0)).toBe(true)
    expect(diagramEquals(right.diagram, e0)).toBe(true)
  })

  it('satisfies e_i · e_i = δ · e_i', () => {
    const e0 = generator(3, 0)
    const result = multiply(e0, e0)
    expect(result.loops).toBe(1)
    expect(diagramEquals(result.diagram, e0)).toBe(true)
  })

  it('satisfies e_i · e_{i±1} · e_i = e_i', () => {
    const e0 = generator(3, 0)
    const e1 = generator(3, 1)
    const left = product(e0, e1, e0)
    const right = product(e1, e0, e1)
    expect(left.loops).toBe(0)
    expect(diagramEquals(left.diagram, e0)).toBe(true)
    expect(right.loops).toBe(0)
    expect(diagramEquals(right.diagram, e1)).toBe(true)
  })

  it('satisfies e_i · e_j = e_j · e_i when |i - j| ≥ 2', () => {
    const e0 = generator(4, 0)
    const e2 = generator(4, 2)
    const left = multiply(e0, e2)
    const right = multiply(e2, e0)
    expect(left.loops).toBe(0)
    expect(diagramEquals(left.diagram, right.diagram)).toBe(true)
  })

  it('refuses to multiply diagrams of different rank', () => {
    expect(() => multiply(identity(2), identity(3))).toThrow(RangeError)
  })
})
