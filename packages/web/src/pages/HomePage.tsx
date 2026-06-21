import { MathText } from '../components/MathText'
import { toHash } from '../router'
import { TOOLS, type ToolMeta } from '../tools'

function ToolCard({ tool }: { tool: ToolMeta }) {
  const available = tool.status === 'available'
  return (
    <a
      href={toHash(tool.id)}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">{tool.name}</h3>
        {available ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-950/50 dark:text-emerald-300">
            Live
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:bg-slate-700 dark:text-slate-400">
            Soon
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        <MathText>{tool.tagline}</MathText>
      </p>
      <span className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
        {/* Written as a unicode escape so the source stays ASCII. */}
        {available ? 'Open playground \u2192' : 'Learn more \u2192'}
      </span>
    </a>
  )
}

export function HomePage() {
  return (
    <div className="py-6">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">diagrammatic-lab</h1>
        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
          An interactive workbench for <em>diagrammatic algebra</em> - diagrams as mathematical
          objects you can build, multiply, and rewrite. A companion to Chris Bowman&rsquo;s{' '}
          <em>Diagrammatic Algebra</em>, growing one playground at a time.
        </p>
      </section>

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        Playgrounds
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}
