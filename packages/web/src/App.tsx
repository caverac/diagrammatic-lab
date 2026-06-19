import { useEffect, useState, type ReactElement } from 'react'

import { ComingSoon } from './components/ComingSoon'
import { NavBar } from './components/NavBar'
import { Sidebar } from './components/Sidebar'
import { useHashRoute } from './hooks/useHashRoute'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { TemperleyLiebPage } from './playgrounds/temperley-lieb/TemperleyLiebPage'
import { documentTitle, findTool } from './tools'

function renderRoute(route: string): ReactElement {
  if (route === 'temperley-lieb') {
    return <TemperleyLiebPage />
  }
  const tool = findTool(route)
  if (tool) {
    return <ComingSoon tool={tool} />
  }
  return <HomePage />
}

export function App() {
  const { theme, toggle } = useTheme()
  const route = useHashRoute()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.title = documentTitle(route)
  }, [route])

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [route])

  return (
    <div className="flex min-h-full flex-col">
      <NavBar
        theme={theme}
        onToggleTheme={toggle}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <Sidebar route={route} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="min-w-0 flex-1 px-4 sm:px-6">{renderRoute(route)}</main>
      </div>
    </div>
  )
}
