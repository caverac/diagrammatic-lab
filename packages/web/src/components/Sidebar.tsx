import { HOME_ROUTE, toHash } from '../router'
import { TOOLS } from '../tools'

interface SidebarLinkProps {
  readonly href: string
  readonly label: string
  readonly active: boolean
  readonly badge?: string
  readonly onClick?: () => void
}

function SidebarLink({ href, label, active, badge, onClick }: SidebarLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
        active
          ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <span>{label}</span>
      {badge && (
        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase dark:bg-slate-700 dark:text-slate-400">
          {badge}
        </span>
      )}
    </a>
  )
}

function NavList({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      <SidebarLink href="#/" label="Home" active={route === HOME_ROUTE} onClick={onNavigate} />
      <div className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        Playgrounds
      </div>
      {TOOLS.map((tool) => (
        <SidebarLink
          key={tool.id}
          href={toHash(tool.id)}
          label={tool.name}
          active={route === tool.id}
          badge={tool.status === 'coming-soon' ? 'soon' : undefined}
          onClick={onNavigate}
        />
      ))}
    </nav>
  )
}

export interface SidebarProps {
  readonly route: string
  /** Whether the mobile drawer is open. */
  readonly open: boolean
  readonly onClose: () => void
}

export function Sidebar({ route, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Persistent sidebar on larger screens. */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 sm:block dark:border-slate-800">
        <div className="sticky top-14 p-4">
          <NavList route={route} />
        </div>
      </aside>

      {/* Slide-over drawer on small screens. */}
      {open && (
        <div className="fixed inset-0 z-40 sm:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50"
          />
          <div className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-900">
            <NavList route={route} onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  )
}
