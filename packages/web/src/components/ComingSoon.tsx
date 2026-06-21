import { MathText } from '@/components/MathText'
import { type ToolMeta } from '@/tools'

/** Placeholder shown for a registered-but-not-yet-built playground. */
export interface ComingSoonProps {
  readonly tool: ToolMeta
}

export function ComingSoon({ tool }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-700 uppercase dark:bg-amber-950/50 dark:text-amber-300">
        Coming soon
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{tool.name}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        <MathText>{tool.tagline}</MathText>
      </p>
      <p className="mt-6 text-sm text-slate-500">
        This playground is on the roadmap. For now, explore the{' '}
        <a href="#/temperley-lieb" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Temperley-Lieb
        </a>{' '}
        module.
      </p>
    </div>
  )
}
