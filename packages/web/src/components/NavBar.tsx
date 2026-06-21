import { GitHubIcon, LogoMark, MenuIcon, MoonIcon, SunIcon } from '@/components/icons'
import { type Theme } from '@/theme'

export interface NavBarProps {
  readonly theme: Theme
  readonly onToggleTheme: () => void
  readonly onMenuToggle: () => void
}

export function NavBar({ theme, onToggleTheme, onMenuToggle }: NavBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
          className="-ml-1 rounded-md p-2 text-slate-600 transition hover:bg-slate-100 sm:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <a href="#/" className="flex items-center gap-2 font-semibold tracking-tight">
          <LogoMark className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>diagrammatic-lab</span>
        </a>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/caverac/diagrammatic-lab"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="group hidden flex-col items-center leading-tight sm:flex"
          >
            <GitHubIcon className="h-5 w-5 text-slate-600 transition group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white" />
            <span className="text-[10px] text-slate-400">v{__APP_VERSION__}</span>
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}
