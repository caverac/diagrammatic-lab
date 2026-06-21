import { deltaPowerTex, moveTex, wordTex } from '@/playgrounds/rewriting/tex'

describe('wordTex', () => {
  it('renders a word of generators, with the empty word as 1', () => {
    expect(wordTex([])).toBe('1')
    expect(wordTex([1, 0, 1])).toBe('e_{2}e_{1}e_{2}')
  })
})

describe('deltaPowerTex', () => {
  it('renders the power of delta', () => {
    expect(deltaPowerTex(0)).toBe('')
    expect(deltaPowerTex(1)).toBe('\\delta')
    expect(deltaPowerTex(3)).toBe('\\delta^{3}')
  })
})

describe('moveTex', () => {
  it('renders the relation each move applies', () => {
    expect(moveTex({ kind: 'loop', at: 0 }, [0, 0])).toBe('e_{1}e_{1} = \\delta\\, e_{1}')
    expect(moveTex({ kind: 'contract', at: 0 }, [0, 1, 0])).toBe('e_{1}e_{2}e_{1} = e_{1}')
    expect(moveTex({ kind: 'commute', at: 0 }, [0, 2])).toBe('e_{1}e_{3} = e_{3}e_{1}')
  })
})
