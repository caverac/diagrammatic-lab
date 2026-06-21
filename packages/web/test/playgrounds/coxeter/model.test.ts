import {
  bruhatGraph,
  bruhatLeq,
  descents,
  identityPermutation,
  isIdentityPermutation,
  longestElement,
  numReducedWords,
  oneLine,
  permLength,
  reducedWord,
  symmetricGroup,
  timesGenerator,
  type Permutation
} from '../../../src/playgrounds/coxeter/model'

/** Reconstruct a permutation by applying a word of generators to the identity. */
function applyWord(n: number, word: readonly number[]): Permutation {
  return word.reduce<Permutation>((p, i) => timesGenerator(p, i), identityPermutation(n))
}

describe('permutations', () => {
  it('builds the identity and reads one-line notation', () => {
    expect(identityPermutation(3)).toEqual([0, 1, 2])
    expect(oneLine([1, 0, 2])).toBe('213')
    expect(isIdentityPermutation([0, 1, 2])).toBe(true)
    expect(isIdentityPermutation([1, 0, 2])).toBe(false)
  })

  it('computes length as the number of inversions', () => {
    expect(permLength([0, 1, 2])).toBe(0)
    expect(permLength([2, 1, 0])).toBe(3)
    expect(permLength(longestElement(4))).toBe(6)
  })

  it('finds right descents', () => {
    expect(descents([0, 1, 2])).toEqual([])
    expect(descents([1, 0, 2])).toEqual([0])
    expect(descents([2, 1, 0])).toEqual([0, 1])
  })

  it('right-multiplies by a generator (a position swap)', () => {
    expect(timesGenerator([0, 1, 2], 0)).toEqual([1, 0, 2])
    expect(timesGenerator([0, 1, 2], 1)).toEqual([0, 2, 1])
  })
})

describe('symmetric group', () => {
  it('enumerates S_n in lexicographic order', () => {
    expect(symmetricGroup(0)).toEqual([[]])
    expect(symmetricGroup(1)).toEqual([[0]])
    expect(symmetricGroup(3)).toHaveLength(6)
    expect(symmetricGroup(4)).toHaveLength(24)
    expect(symmetricGroup(3)[0]).toEqual([0, 1, 2])
    expect(symmetricGroup(3)[5]).toEqual([2, 1, 0])
  })
})

describe('reduced words', () => {
  it('gives the empty word for the identity', () => {
    expect(reducedWord(identityPermutation(3))).toEqual([])
  })

  it('gives a shortest word that reconstructs the permutation', () => {
    for (const p of symmetricGroup(4)) {
      const word = reducedWord(p)
      expect(word).toHaveLength(permLength(p))
      expect(applyWord(4, word)).toEqual(p)
    }
  })

  it('counts reduced words', () => {
    expect(numReducedWords(identityPermutation(3))).toBe(1)
    expect(numReducedWords(longestElement(3))).toBe(2)
    expect(numReducedWords(longestElement(4))).toBe(16)
  })
})

describe('Bruhat order', () => {
  it('has the identity as minimum and w_0 as maximum', () => {
    const w0 = longestElement(3)
    for (const p of symmetricGroup(3)) {
      expect(bruhatLeq(identityPermutation(3), p)).toBe(true)
      expect(bruhatLeq(p, w0)).toBe(true)
    }
    expect(bruhatLeq(w0, identityPermutation(3))).toBe(false)
    expect(bruhatLeq(w0, w0)).toBe(true)
  })

  it('has incomparable elements of equal length', () => {
    expect(bruhatLeq([1, 0, 2], [0, 2, 1])).toBe(false)
    expect(bruhatLeq([0, 2, 1], [1, 0, 2])).toBe(false)
  })
})

describe('Bruhat Hasse diagram', () => {
  it('ranks S_3 with its eight covering relations', () => {
    const graph = bruhatGraph(3)
    expect(graph.nodes).toHaveLength(6)
    expect(graph.edges).toHaveLength(8)
    expect(graph.maxLength).toBe(3)

    const identity = graph.nodes[0]
    expect(identity.length).toBe(0)
    expect(identity.y).toBe(0)
    for (const node of graph.nodes) {
      expect(node.x).toBeGreaterThan(0)
      expect(node.x).toBeLessThan(1)
    }
  })

  it('grades S_4 so the identity and w_0 each have three covers', () => {
    const graph = bruhatGraph(4)
    expect(graph.nodes).toHaveLength(24)
    const top = graph.nodes.length - 1
    expect(graph.edges.filter(([lower]) => lower === 0)).toHaveLength(3)
    expect(graph.edges.filter(([, upper]) => upper === top)).toHaveLength(3)
    expect(graph.nodes[top].y).toBe(1)
  })
})
