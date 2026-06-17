import { useState } from 'react'

/**
 * Login control — a stub. Real authentication is not wired up yet; clicking
 * "Sign in" just toggles a mock signed-in state so the navigation bar reflects
 * both views. Replace with a real auth provider later.
 */
export function LoginButton() {
  const [user, setUser] = useState<string | null>(null)

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {user.slice(0, 2).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={() => setUser(null)}
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setUser('guest')}
      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
    >
      Sign in
    </button>
  )
}
