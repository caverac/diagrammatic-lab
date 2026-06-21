import { parseDropIndex } from '@/playgrounds/temperley-lieb/dnd'

describe('parseDropIndex', () => {
  it('accepts non-negative integers', () => {
    expect(parseDropIndex('0')).toBe(0)
    expect(parseDropIndex('7')).toBe(7)
  })

  it('rejects empty, non-numeric, negative, or fractional input', () => {
    expect(parseDropIndex('')).toBeNull()
    expect(parseDropIndex('abc')).toBeNull()
    expect(parseDropIndex('-1')).toBeNull()
    expect(parseDropIndex('2.5')).toBeNull()
  })
})
