import {
  buildKLView,
  defaultTopIndex,
  isTrivial,
  singularElements
} from '@/playgrounds/kazhdan-lusztig/model'

describe('isTrivial', () => {
  it('recognizes the constant polynomial 1', () => {
    expect(isTrivial([1])).toBe(true)
    expect(isTrivial([1, 1])).toBe(false)
    expect(isTrivial([])).toBe(false)
  })
})

describe('singularElements', () => {
  it('is empty for S_3 and finds 4231 and 3412 in S_4', () => {
    expect(singularElements(3)).toEqual([])
    // S_4 has exactly the two singular Schubert varieties.
    expect(singularElements(4)).toHaveLength(2)
  })
})

describe('defaultTopIndex', () => {
  it('prefers a singular element, falling back to w_0', () => {
    // S_3: no singular elements, so w_0 (the last node) is chosen.
    expect(defaultTopIndex(3)).toBe(5)
    // S_4: the first singular element.
    expect(defaultTopIndex(4)).toBe(singularElements(4)[0])
  })
})

describe('buildKLView', () => {
  it('marks the interval below y and flags the singular node', () => {
    const top = singularElements(4)[0]
    const view = buildKLView(4, top)
    expect(view.nodes).toHaveLength(24)
    expect(view.topIndex).toBe(top)

    // The identity is below everything and is the singular point with P = 1 + q.
    const identity = view.nodes[0]
    expect(identity.inInterval).toBe(true)
    expect(identity.nontrivial).toBe(true)
    expect(identity.polynomial).toEqual([1, 1])

    // The top element itself has P = 1 (trivial).
    expect(view.nodes[top].polynomial).toEqual([1])
    expect(view.nodes[top].nontrivial).toBe(false)

    // Some node lies outside the interval [e, y].
    expect(view.nodes.some((node) => !node.inInterval)).toBe(true)
  })
})
