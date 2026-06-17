import { HOME_ROUTE, toHash } from '../router'
import { TOOLS } from '../tools'

interface SidebarLinkProps {
  readonly href: string
  readonly label: string
  readonly active: boolean
  readonly badge?: string
}

function SidebarLink({ href, label, active, badge }: SidebarLinkProps) {
  return (
    <a
      href={href}
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

export interface SidebarProps {
  readonly route: string
}

export function Sidebar({ route }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 sm:block dark:border-slate-800">
      <nav className="sticky top-14 space-y-1 p-4">
        <SidebarLink href="#/" label="Home" active={route === HOME_ROUTE} />
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
          />
        ))}
      </nav>
    </aside>
  )
}
