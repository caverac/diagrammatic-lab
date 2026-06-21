import { coefficientTex, temperleyLiebTex } from '../../../src/playgrounds/temperley-lieb/tex'

describe('coefficientTex', () => {
  it('formats the power of delta as LaTeX', () => {
    expect(coefficientTex(0)).toBe('')
    expect(coefficientTex(1)).toBe('\\delta')
    expect(coefficientTex(3)).toBe('\\delta^{3}')
  })
})

describe('temperleyLiebTex', () => {
  it('writes the algebra name', () => {
    expect(temperleyLiebTex(4)).toBe('\\mathrm{TL}_{4}(\\delta)')
  })
})
