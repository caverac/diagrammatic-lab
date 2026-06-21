import {
  boundaryIndex,
  diagram,
  diagramEquals,
  diagramKey,
  endpoint,
  endpointEquals,
  fromBoundaryIndex,
  generator,
  identity,
  type Arc
} from '../src'

describe('endpoints', () => {
  it('constructs and compares endpoints', () => {
    expect(endpoint('top', 2)).toEqual({ row: 'top', pos: 2 })
    expect(endpointEquals(endpoint('top', 1), endpoint('top', 1))).toBe(true)
    expect(endpointEquals(endpoint('top', 1), endpoint('bottom', 1))).toBe(false)
    expect(endpointEquals(endpoint('top', 1), endpoint('top', 2))).toBe(false)
  })

  it('maps endpoints to boundary indices and back (clockwise)', () => {
    const rank = 3
    // top row left->right, then bottom row right->left
    expect(boundaryIndex(rank, endpoint('top', 0))).toBe(0)
    expect(boundaryIndex(rank, endpoint('top', 2))).toBe(2)
    expect(boundaryIndex(rank, endpoint('bottom', 2))).toBe(3)
    expect(boundaryIndex(rank, endpoint('bottom', 0))).toBe(5)
    for (let i = 0; i < 2 * rank; i += 1) {
      expect(boundaryIndex(rank, fromBoundaryIndex(rank, i))).toBe(i)
    }
  })
})

describe('standard diagrams', () => {
  it('builds the identity as straight through-strands', () => {
    const id = identity(3)
    expect(id.rank).toBe(3)
    expect(id.arcs).toHaveLength(3)
    expect(diagramEquals(id, diagram(3, id.arcs))).toBe(true)
  })

  it('builds the generator e_i with a cup, a cap, and through-strands', () => {
    const e1 = generator(4, 1)
    const expected: Arc[] = [
      [endpoint('top', 1), endpoint('top', 2)],
      [endpoint('bottom', 1), endpoint('bottom', 2)],
      [endpoint('top', 0), endpoint('bottom', 0)],
      [endpoint('top', 3), endpoint('bottom', 3)]
    ]
    expect(diagramEquals(e1, diagram(4, expected))).toBe(true)
  })

  it('rejects out-of-range or non-integer generator indices', () => {
    expect(() => generator(3, -1)).toThrow(RangeError)
    expect(() => generator(3, 2)).toThrow(RangeError)
    expect(() => generator(3, 0.5)).toThrow(RangeError)
  })
})

describe('canonical keys', () => {
  it('is independent of arc and endpoint ordering', () => {
    const a = diagram(2, [
      [endpoint('top', 0), endpoint('top', 1)],
      [endpoint('bottom', 0), endpoint('bottom', 1)]
    ])
    const b = diagram(2, [
      [endpoint('bottom', 1), endpoint('bottom', 0)],
      [endpoint('top', 1), endpoint('top', 0)]
    ])
    expect(diagramKey(a)).toBe(diagramKey(b))
    expect(diagramEquals(a, b)).toBe(true)
  })

  it('separates different diagrams and different ranks', () => {
    expect(diagramEquals(identity(2), generator(2, 0))).toBe(false)
    expect(diagramEquals(identity(2), identity(3))).toBe(false)
  })
})
