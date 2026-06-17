/** Pure colour-theme logic, kept free of the DOM so it can be unit-tested. */

export type Theme = 'light' | 'dark'

/** The localStorage key under which the chosen theme is persisted. */
export const THEME_STORAGE_KEY = 'diagrammatic-lab.theme'

/**
 * Decide the initial theme: an explicitly stored choice wins; otherwise fall
 * back to the operating system's preference.
 */
export function resolveInitialTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return prefersDark ? 'dark' : 'light'
}

/** The opposite theme. */
export function toggleTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark'
}
