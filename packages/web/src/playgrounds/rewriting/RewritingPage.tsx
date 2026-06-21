import { applicableMoves, applyMove, reduce, type Move } from '@diagrammatic-lab/core'
import { useState, type ReactNode } from 'react'

import { Math } from '@/components/Math'
import { viewOf } from '@/playgrounds/rewriting/model'
import { deltaPowerTex, moveTex, wordTex } from '@/playgrounds/rewriting/tex'

const RANKS = [3, 4, 5] as const
const EXAMPLE: number[] = [0, 1, 0, 2, 1]

const chip =
  'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900'
const numOn = 'h-9 w-9 rounded-md bg-indigo-600 font-medium text-white shadow-sm'
const numOff =
  'h-9 w-9 rounded-md border border-slate-200 bg-white transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'

export function RewritingPage() {
  const [n, setN] = useState(4)
  const [word, setWord] = useState<number[]>(EXAMPLE)
  const [delta, setDelta] = useState(0)

  const view = viewOf(n, word, delta)
  const moves = applicableMoves(word)
  const reduced = !moves.some((move) => move.kind !== 'commute')

  function chooseN(value: number): void {
    setN(value)
    setWord([])
    setDelta(0)
  }

  function appendGenerator(i: number): void {
    setWord([...word, i])
  }

  function apply(move: Move): void {
    const result = applyMove(word, move)
    setWord([...result.word])
    setDelta(delta + result.delta)
  }

  function autoReduce(): void {
    const steps = reduce(word)
    if (steps.length > 0) {
      const last = steps[steps.length - 1]
      setWord([...last.word])
      setDelta(delta + last.delta)
    }
  }

  const lhs = `${deltaPowerTex(delta)}${delta > 0 ? '\\,' : ''}${wordTex(word)}`
  const coefficient = deltaPowerTex(view.totalDelta)

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Diagram Rewriting</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
          A word in the Temperley-Lieb generators <Math tex="e_i" /> is simplified by the defining
          relations, applied as local moves. Each move leaves the underlying diagram unchanged -
          only its <Math tex="\delta" /> coefficient grows - so rewriting and stacking agree. Build
          a word, then apply moves (or auto-reduce) to reach its normal form.
        </p>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          <Math tex={`\\mathrm{TL}_{${n}}`} />, generators
        </span>
        {Array.from({ length: n - 1 }, (_, i) => (
          <button key={i} type="button" onClick={() => appendGenerator(i)} className={chip}>
            <Math tex={`e_{${i + 1}}`} />
          </button>
        ))}
        <button type="button" onClick={() => setWord(EXAMPLE)} className={`ml-2 ${chip}`}>
          Example
        </button>
        <button
          type="button"
          onClick={() => {
            setWord([])
            setDelta(0)
          }}
          className={chip}
        >
          Clear
        </button>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            <Math tex="n" /> =
          </span>
          {RANKS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseN(value)}
              className={value === n ? numOn : numOff}
            >
              {value}
            </button>
          ))}
        </span>
      </section>

      {/* The rewriting equation: current word = normal form. */}
      <section className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-lg">
          <Math tex={lhs} />
        </span>
        <span className="text-2xl text-slate-400">=</span>
        {coefficient && (
          <span className="text-lg text-indigo-600 dark:text-indigo-400">
            <Math tex={`${coefficient}\\,\\cdot`} />
          </span>
        )}
        <span
          className="text-slate-700 [&_svg]:block dark:text-slate-200"
          dangerouslySetInnerHTML={{ __html: view.svg }}
        />
        {reduced && (
          <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            normal form
          </span>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Applicable moves
          </h2>
          <button
            type="button"
            onClick={autoReduce}
            disabled={reduced}
            className={`text-sm font-medium text-indigo-600 disabled:opacity-40 dark:text-indigo-400`}
          >
            auto-reduce &rarr;
          </button>
        </div>
        {moves.length === 0 ? (
          <p className="text-sm text-slate-400">
            No moves apply - this word is reduced (or empty). Add generators to build a word.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {moves.map((move, index) => (
              <button
                key={index}
                type="button"
                onClick={() => apply(move)}
                className={`flex items-center gap-2 ${chip}`}
              >
                <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                  {move.kind}
                </span>
                <Math tex={moveTex(move, word)} />
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <ConceptCard title="Loop">
          <Math tex="e_i e_i = \delta\, e_i" />. Two equal generators in a row close a loop, which
          peels off as one factor of <Math tex="\delta" />.
        </ConceptCard>
        <ConceptCard title="Contract">
          <Math tex="e_i e_{i \pm 1} e_i = e_i" />. A generator sandwiching an adjacent one
          collapses to a single generator.
        </ConceptCard>
        <ConceptCard title="Commute">
          <Math tex="e_i e_j = e_j e_i" /> for <Math tex="|i - j| \ge 2" />. Far-apart generators
          slide past each other, often exposing a loop or contraction.
        </ConceptCard>
      </div>
    </div>
  )
}

function ConceptCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{children}</p>
    </section>
  )
}
