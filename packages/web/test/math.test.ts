import { renderMath } from '../src/math'

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
