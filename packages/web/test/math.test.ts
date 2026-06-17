import { coefficientTex, renderMath, temperleyLiebTex } from '../src/math'

describe('renderMath', () => {
  it('renders LaTeX to KaTeX HTML', () => {
    const html = renderMath('\\delta^{2}', false)
    expect(html).toContain('katex')
  })

  it('supports display mode', () => {
    expect(renderMath('D_1', true)).toContain('katex-display')
  })

  it('does not throw on invalid input', () => {
    expect(() => renderMath('\\frac{', false)).not.toThrow()
  })
})

describe('coefficientTex', () => {
  it('formats the power of δ as LaTeX', () => {
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
