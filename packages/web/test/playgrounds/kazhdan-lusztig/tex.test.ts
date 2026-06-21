import { polynomialTex } from '@/playgrounds/kazhdan-lusztig/tex'

describe('polynomialTex', () => {
  it('renders the zero and empty polynomials as 0', () => {
    expect(polynomialTex([])).toBe('0')
    expect(polynomialTex([0])).toBe('0')
  })

  it('renders constants and the variable q', () => {
    expect(polynomialTex([1])).toBe('1')
    expect(polynomialTex([3])).toBe('3')
    expect(polynomialTex([0, 1])).toBe('q')
  })

  it('omits unit coefficients and raises powers', () => {
    expect(polynomialTex([1, 1])).toBe('1 + q')
    expect(polynomialTex([1, 0, 1])).toBe('1 + q^{2}')
    expect(polynomialTex([1, 2, 1])).toBe('1 + 2q + q^{2}')
  })
})
