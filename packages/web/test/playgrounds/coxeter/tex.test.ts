import { generatorTex, reducedWordTex } from '../../../src/playgrounds/coxeter/tex'

describe('generatorTex', () => {
  it('renders a 1-indexed generator', () => {
    expect(generatorTex(0)).toBe('s_{1}')
    expect(generatorTex(2)).toBe('s_{3}')
  })
})

describe('reducedWordTex', () => {
  it('renders the empty word as the identity', () => {
    expect(reducedWordTex([])).toBe('e')
  })

  it('renders a product of generators', () => {
    expect(reducedWordTex([1, 0, 1])).toBe('s_{2}s_{1}s_{2}')
  })
})
