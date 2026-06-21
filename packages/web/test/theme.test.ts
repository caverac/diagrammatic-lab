import { resolveInitialTheme, toggleTheme } from '@/theme'

describe('resolveInitialTheme', () => {
  it('honours an explicitly stored choice', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark')
    expect(resolveInitialTheme('light', true)).toBe('light')
  })

  it('falls back to the system preference otherwise', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark')
    expect(resolveInitialTheme('nonsense', false)).toBe('light')
  })
})

describe('toggleTheme', () => {
  it('flips between light and dark', () => {
    expect(toggleTheme('light')).toBe('dark')
    expect(toggleTheme('dark')).toBe('light')
  })
})
