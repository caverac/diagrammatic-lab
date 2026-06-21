import { diagramEquals, generator } from '@core/diagram'
import { applicableMoves, applyMove, productOfWord, reduce, type Word } from '@core/rewriting'

describe('applicableMoves', () => {
  it('finds loops, commutes, and contractions', () => {
    expect(applicableMoves([1, 1])).toEqual([{ kind: 'loop', at: 0 }])
    expect(applicableMoves([0, 2])).toEqual([{ kind: 'commute', at: 0 }])
    expect(applicableMoves([0, 1, 0])).toEqual([{ kind: 'contract', at: 0 }])
    // Adjacent unequal generators offer no move on their own.
    expect(applicableMoves([0, 1])).toEqual([])
  })
})

describe('applyMove', () => {
  it('applies each relation, releasing delta only on a loop', () => {
    expect(applyMove([1, 1], { kind: 'loop', at: 0 })).toEqual({ word: [1], delta: 1 })
    expect(applyMove([0, 1, 0], { kind: 'contract', at: 0 })).toEqual({ word: [0], delta: 0 })
    expect(applyMove([0, 2], { kind: 'commute', at: 0 })).toEqual({ word: [2, 0], delta: 0 })
  })
})

describe('productOfWord', () => {
  it('reproduces the Temperley-Lieb relations', () => {
    // e_i e_i = delta e_i
    const square = productOfWord(4, [1, 1])
    expect(square.loops).toBe(1)
    expect(diagramEquals(square.diagram, generator(4, 1))).toBe(true)

    // e_i e_{i+1} e_i = e_i
    const braid = productOfWord(4, [0, 1, 0])
    expect(braid.loops).toBe(0)
    expect(diagramEquals(braid.diagram, generator(4, 0))).toBe(true)

    // e_i e_j = e_j e_i for |i - j| >= 2
    expect(diagramEquals(productOfWord(4, [0, 2]).diagram, productOfWord(4, [2, 0]).diagram)).toBe(
      true
    )
  })
})

describe('reduce', () => {
  it('reduces a square and a braid directly', () => {
    expect(reduce([1, 1])).toEqual([{ move: { kind: 'loop', at: 0 }, word: [1], delta: 1 }])
    expect(reduce([0, 1, 0])).toEqual([{ move: { kind: 'contract', at: 0 }, word: [0], delta: 0 }])
  })

  it('uses a commute to expose a hidden loop', () => {
    // e_0 e_2 e_0 -> (commute) e_2 e_0 e_0 -> (loop) delta e_2 e_0
    const steps = reduce([0, 2, 0])
    expect(steps.map((s) => s.move.kind)).toEqual(['commute', 'loop'])
    expect(steps[steps.length - 1].word).toEqual([2, 0])
    expect(steps[steps.length - 1].delta).toBe(1)
  })

  it('stops when no reducing move is reachable', () => {
    expect(reduce([0, 2])).toEqual([])
  })

  it('preserves the diagram and total delta (the relations are sound)', () => {
    const words: Word[] = [
      [0, 0],
      [0, 1, 0],
      [0, 2, 0],
      [1, 0, 1, 2, 1],
      [2, 1, 0, 0, 1, 2]
    ]
    for (const word of words) {
      const steps = reduce(word)
      const finalWord = steps.length > 0 ? steps[steps.length - 1].word : word
      const finalDelta = steps.length > 0 ? steps[steps.length - 1].delta : 0

      const before = productOfWord(4, word)
      const after = productOfWord(4, finalWord)
      // Rewriting changes neither the diagram nor the algebra element.
      expect(diagramEquals(after.diagram, before.diagram)).toBe(true)
      expect(finalDelta + after.loops).toBe(before.loops)
      // The reduced word admits no further loop or contract.
      expect(applicableMoves(finalWord).some((m) => m.kind !== 'commute')).toBe(false)
    }
  })
})
