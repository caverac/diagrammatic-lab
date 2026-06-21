import { parseInlineMath, renderMath } from '@/math'

describe('parseInlineMath', () => {
  it('returns a single text run when there is no math', () => {
    expect(parseInlineMath('plain prose')).toEqual([{ type: 'text', value: 'plain prose' }])
  })

  it('splits prose and inline math', () => {
    expect(parseInlineMath('order in $S_n$ here')).toEqual([
      { type: 'text', value: 'order in ' },
      { type: 'math', value: 'S_n' },
      { type: 'text', value: ' here' }
    ])
  })

  it('drops the empty runs around leading/trailing math', () => {
    expect(parseInlineMath('$x$')).toEqual([{ type: 'math', value: 'x' }])
  })
})

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
