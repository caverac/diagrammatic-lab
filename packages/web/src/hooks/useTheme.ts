import { useCallback, useEffect, useState } from 'react'

import { resolveInitialTheme, THEME_STORAGE_KEY, toggleTheme, type Theme } from '../theme'

/**
 * Manage the active colour theme: initialise from storage / system preference,
 * reflect it on `<html class="dark">`, and persist any change.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() =>
    resolveInitialTheme(
      localStorage.getItem(THEME_STORAGE_KEY),
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(() => setTheme(toggleTheme), [])

  return { theme, toggle }
}
