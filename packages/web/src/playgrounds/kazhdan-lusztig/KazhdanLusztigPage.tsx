import { oneLine } from '@diagrammatic-lab/core'
import { useMemo, useState, type ReactNode } from 'react'

import { Math } from '@/components/Math'
import { KLDiagram } from '@/playgrounds/kazhdan-lusztig/components/KLDiagram'
import {
  buildKLView,
  defaultTopIndex,
  isTrivial,
  singularElements
} from '@/playgrounds/kazhdan-lusztig/model'
import { polynomialTex } from '@/playgrounds/kazhdan-lusztig/tex'

const RANKS = [3, 4] as const

const selectedBtn = 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm'
const plainBtn =
  'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'
const numBtnOn = 'h-9 w-9 rounded-md bg-indigo-600 font-medium text-white shadow-sm'
const numBtnOff =
  'h-9 w-9 rounded-md border border-slate-200 bg-white transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'

export function KazhdanLusztigPage() {
  const [n, setN] = useState(4)
  const [topIndex, setTopIndex] = useState(() => defaultTopIndex(4))
  const [selected, setSelected] = useState(0)

  const view = useMemo(() => buildKLView(n, topIndex), [n, topIndex])
  const singular = useMemo(() => singularElements(n), [n])

  const topNode = view.nodes[topIndex]
  const xNode = view.nodes[selected]
  const w0Index = view.nodes.length - 1
  const candidates = singular.includes(w0Index) ? singular : [...singular, w0Index]
  const topIsSmooth = isTrivial(view.nodes[0].polynomial)

  function chooseN(value: number): void {
    setN(value)
    setTopIndex(defaultTopIndex(value))
    setSelected(0)
  }

  function chooseTop(index: number): void {
    setTopIndex(index)
    setSelected(0)
  }

  function inspect(index: number): void {
    if (view.nodes[index].inInterval) {
      setSelected(index)
    }
  }

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Kazhdan-Lusztig</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
          For <Math tex="x \le y" /> in the Bruhat order, the Kazhdan-Lusztig polynomial{' '}
          <Math tex="P_{x,y}(q)" /> is a deep invariant of the pair. Geometrically{' '}
          <Math tex="P_{e,w} = 1" /> exactly when the Schubert variety <Math tex="X_w" /> is
          rationally smooth - so the <span className="text-amber-600">amber</span> nodes below are
          the singular ones. Pick a top element <Math tex="y" /> and click any{' '}
          <Math tex="x \le y" /> to read off <Math tex="P_{x,y}" />.
        </p>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          <Math tex="S_n" />, <Math tex="n" /> =
        </span>
        {RANKS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => chooseN(value)}
            className={value === n ? numBtnOn : numBtnOff}
          >
            {value}
          </button>
        ))}
      </section>

      <section className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Top <Math tex="y" /> =
        </span>
        {candidates.map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => chooseTop(index)}
            className={`font-mono ${index === topIndex ? selectedBtn : plainBtn}`}
          >
            {oneLine(view.nodes[index].perm)}
            <span className="ml-1.5 font-sans text-[10px] tracking-wide uppercase opacity-70">
              {singular.includes(index) ? 'singular' : 'smooth'}
            </span>
          </button>
        ))}
        {singular.length === 0 && (
          <span className="text-sm text-slate-500">
            (every Schubert variety in <Math tex={`S_${n}`} /> is smooth)
          </span>
        )}
      </section>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:min-w-0 lg:flex-1 dark:border-slate-800 dark:bg-slate-900">
          <KLDiagram view={view} size={680} selected={selected} onSelect={inspect} />
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-slate-500">
            <Swatch color="rgb(224, 231, 255)" label="smooth (P = 1)" />
            <Swatch color="rgb(254, 215, 170)" label="singular (P != 1)" />
            <Swatch color="rgb(248, 250, 252)" label="outside [e, y]" />
          </div>
        </div>

        <dl className="grid w-full grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm lg:w-80 lg:shrink-0">
          <dt className="text-slate-500">Pair</dt>
          <dd className="font-mono font-semibold">
            {oneLine(xNode.perm)} &le; {oneLine(topNode.perm)}
          </dd>

          <dt className="text-slate-500">
            <Math tex="P_{x,y}(q)" />
          </dt>
          <dd className="font-medium text-indigo-700 dark:text-indigo-300">
            <Math tex={polynomialTex(xNode.polynomial)} />
          </dd>

          <dt className="text-slate-500">Length gap</dt>
          <dd className="font-medium">
            <Math tex={`\\ell(y) - \\ell(x) = ${topNode.length - xNode.length}`} />
          </dd>

          <dt className="text-slate-500">Degree</dt>
          <dd className="font-medium">{xNode.polynomial.length - 1}</dd>

          <dt className="self-start text-slate-500">
            <Math tex="X_y" />
          </dt>
          <dd className="font-medium">
            {topIsSmooth ? (
              <span className="text-emerald-600 dark:text-emerald-400">rationally smooth</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                singular, via <Math tex={`P_{e,y} = ${polynomialTex(view.nodes[0].polynomial)}`} />
              </span>
            )}
          </dd>
        </dl>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <ConceptCard title="A polynomial per Bruhat pair">
          <Math tex="P_{x,y}" /> is defined through the Hecke algebra and computed by a recursion on
          length. Always <Math tex="P_{x,x} = 1" />, and <Math tex="P_{x,y} = 1" /> whenever{' '}
          <Math tex="\ell(y) - \ell(x) \le 2" />, with degree at most{' '}
          <Math tex="(\ell(y) - \ell(x) - 1)/2" />.
        </ConceptCard>

        <ConceptCard title="A smoothness detector">
          The constant term is always 1; a higher term means the Schubert variety <Math tex="X_y" />{' '}
          is singular along the cell of <Math tex="x" />. The smallest singular examples are{' '}
          <span className="font-mono">4231</span> and <span className="font-mono">3412</span> in{' '}
          <Math tex="S_4" />, both with <Math tex="P_{e,y} = 1 + q" />.
        </ConceptCard>

        <ConceptCard title="The mu coefficient">
          The top coefficient <Math tex="\mu(x,y)" /> drives the recursion and labels the edges of
          the <Math tex="W" />
          -graph that builds the Kazhdan-Lusztig basis of the Hecke algebra.
        </ConceptCard>

        <ConceptCard title="Reading the diagram">
          The lit nodes form the interval <Math tex="[e, y]" />: the permutations <Math tex="x" />{' '}
          with <Math tex="x \le y" />. Indigo nodes are smooth points, amber nodes are singular, and
          faint nodes lie outside the interval.
        </ConceptCard>
      </div>
    </div>
  )
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-4 rounded-sm border border-slate-300"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
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
