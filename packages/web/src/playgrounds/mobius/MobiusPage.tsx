import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react'

import { Math } from '../../components/Math'

import { KaleidoscopeSphere } from './components/KaleidoscopeSphere'
import {
  buildGroup,
  classifyMobius,
  orbit,
  polytopeEdges,
  quatMul,
  quatToMobius,
  representativeRotation,
  rotationQuat,
  traceMobius,
  vec3,
  type GroupId,
  type Quaternion
} from './model'
import {
  axisCensus,
  polyhedronVEF,
  schwarzTiling,
  seedFor,
  stabilizerOrder,
  type SeedPreset
} from './symmetry'
import {
  classLabel,
  complexTex,
  foldName,
  groupName,
  groupTex,
  isomorphismName,
  presentationTex,
  schwarzSymbol,
  solidName
} from './tex'

const GROUP_IDS: readonly GroupId[] = [
  'cyclic',
  'dihedral',
  'tetrahedral',
  'octahedral',
  'icosahedral'
]
const PARAMETRIC: ReadonlySet<GroupId> = new Set<GroupId>(['cyclic', 'dihedral'])
const ORDERS = [3, 4, 5, 6, 7, 8] as const

const X_AXIS = vec3(1, 0, 0)
const Y_AXIS = vec3(0, 1, 0)
const DRAG_SPEED = 0.01
const INITIAL_VIEW = quatMul(rotationQuat(X_AXIS, -0.42), rotationQuat(Y_AXIS, 0.5))

// Inertia: how fast the spin decays per frame, the per-component speed cap, and
// the speed below which the spin stops.
const FRICTION = 0.94
const MAX_SPIN = 0.18
const MIN_SPIN = 0.0008

function clamp(value: number, limit: number): number {
  if (value < -limit) return -limit
  if (value > limit) return limit
  return value
}

/** Whether an angular velocity is fast enough to keep spinning. */
function spinning(vx: number, vy: number): boolean {
  return vx * vx + vy * vy >= MIN_SPIN * MIN_SPIN
}

/** Seed presets for the orbit-stabilizer lab, with their meaning. */
const POLY_PRESETS: readonly { id: SeedPreset; label: ReactNode }[] = [
  { id: 'generic', label: 'Generic point' },
  {
    id: 'vertex',
    label: (
      <>
        On the <Math tex="n" />
        -fold axis
      </>
    )
  },
  { id: 'face', label: 'On a 3-fold axis' },
  { id: 'edge', label: 'On a 2-fold axis' }
]
const SIMPLE_PRESETS: readonly { id: SeedPreset; label: ReactNode }[] = [
  { id: 'generic', label: 'Generic point' },
  { id: 'vertex', label: 'On the main axis' }
]

/** A legend color matching the axis overlay in the kaleidoscope. */
function axisSwatch(order: number): string {
  if (order === 2) return 'rgb(100, 116, 139)'
  if (order === 3) return 'rgb(245, 158, 11)'
  return 'rgb(244, 63, 94)'
}

const selected = 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm'
const unselected =
  'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'

export function MobiusPage() {
  const [groupId, setGroupId] = useState<GroupId>('icosahedral')
  const [n, setN] = useState(5)
  const [view, setView] = useState<Quaternion>(INITIAL_VIEW)
  const [preset, setPreset] = useState<SeedPreset>('vertex')
  const [showAxes, setShowAxes] = useState(false)
  const drag = useRef<{ x: number; y: number } | null>(null)
  const velocity = useRef({ x: 0, y: 0 })
  const spinFrame = useRef<number | null>(null)

  // Stop any running momentum spin when the component unmounts.
  useEffect(
    () => () => {
      if (spinFrame.current !== null) {
        cancelAnimationFrame(spinFrame.current)
      }
    },
    []
  )

  const group = useMemo(() => buildGroup(groupId, n), [groupId, n])
  const triangles = useMemo(() => schwarzTiling(group), [group])
  const census = useMemo(() => axisCensus(group), [group])
  const seed = useMemo(() => seedFor(groupId, preset), [groupId, preset])
  const orbitPoints = useMemo(() => orbit(group, seed), [group, seed])
  const edges = useMemo(() => polytopeEdges(orbitPoints), [orbitPoints])

  const vef = polyhedronVEF(groupId)
  const stabilizer = stabilizerOrder(group, seed)
  const polyhedral = triangles.length > 0
  const presets = polyhedral ? POLY_PRESETS : SIMPLE_PRESETS

  const mobius = quatToMobius(representativeRotation(group))
  const trace = traceMobius(mobius)
  const klass = classifyMobius(mobius)

  function spin(dx: number, dy: number): void {
    const delta = quatMul(rotationQuat(Y_AXIS, dx), rotationQuat(X_AXIS, dy))
    setView((current) => quatMul(delta, current))
  }

  function coast(): void {
    const v = velocity.current
    if (!spinning(v.x, v.y)) {
      spinFrame.current = null
      return
    }
    spin(v.x, v.y)
    velocity.current = { x: v.x * FRICTION, y: v.y * FRICTION }
    spinFrame.current = requestAnimationFrame(coast)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (spinFrame.current !== null) {
      cancelAnimationFrame(spinFrame.current)
      spinFrame.current = null
    }
    velocity.current = { x: 0, y: 0 }
    drag.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>): void {
    const last = drag.current
    if (!last) {
      return
    }
    const dx = (event.clientX - last.x) * DRAG_SPEED
    const dy = (event.clientY - last.y) * DRAG_SPEED
    drag.current = { x: event.clientX, y: event.clientY }
    spin(dx, dy)
    // Track angular velocity (smoothed and capped) to throw on release.
    velocity.current = {
      x: clamp(dx, MAX_SPIN) * 0.7 + velocity.current.x * 0.3,
      y: clamp(dy, MAX_SPIN) * 0.7 + velocity.current.y * 0.3
    }
  }

  function onPointerUp(): void {
    drag.current = null
    if (spinFrame.current === null && spinning(velocity.current.x, velocity.current.y)) {
      spinFrame.current = requestAnimationFrame(coast)
    }
  }

  // Switch groups, resetting the seed to the best default: a generic point (an
  // n-gon ring) for the cyclic/dihedral families, a vertex (the polyhedron) for
  // the polyhedral ones. On an axis, a cyclic orbit would collapse to a point.
  function chooseGroup(id: GroupId): void {
    setGroupId(id)
    setPreset(PARAMETRIC.has(id) ? 'generic' : 'vertex')
  }

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mobius &amp; Finite Groups</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
          One idea ties this page together: a finite symmetry group <em>is</em> a finite group of
          rotations of the sphere, and rotations are exactly the Mobius transformations{' '}
          <Math tex="z \mapsto (az + b)/(cz + d)" /> that preserve it. By Klein&rsquo;s theorem the
          only finite groups that arise are the cyclic <Math tex="C_n" />, dihedral{' '}
          <Math tex="D_n" />, and the three polyhedral groups <Math tex="A_4, S_4, A_5" />. Pick one
          and watch it act.
        </p>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        {GROUP_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => chooseGroup(id)}
            className={id === groupId ? selected : unselected}
          >
            {groupName(id)}
          </button>
        ))}
      </section>

      {PARAMETRIC.has(groupId) && (
        <section className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            <Math tex="n" /> =
          </span>
          {ORDERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setN(value)}
              className={
                value === n
                  ? 'h-9 w-9 rounded-md bg-indigo-600 font-medium text-white shadow-sm'
                  : 'h-9 w-9 rounded-md border border-slate-200 bg-white transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'
              }
            >
              {value}
            </button>
          ))}
        </section>
      )}

      {/* Hero: kaleidoscope + identity card */}
      <div className="mb-10 flex flex-wrap items-start gap-8">
        <div className="flex flex-col gap-2">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="cursor-grab touch-none rounded-xl border border-slate-200 bg-white p-2 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900"
          >
            <KaleidoscopeSphere
              triangles={triangles}
              orbitPoints={orbitPoints}
              edges={edges}
              axes={census}
              showAxes={showAxes}
              view={view}
              size={380}
            />
          </div>
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>Drag to spin (an elliptic Mobius transformation)</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(event) => setShowAxes(event.target.checked)}
              />
              axes
            </label>
          </div>
        </div>

        <dl className="grid min-w-64 flex-1 grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-slate-500">Group</dt>
          <dd className="font-medium">
            <Math tex={groupTex(groupId, n)} /> &mdash; {isomorphismName(groupId)}
          </dd>

          <dt className="text-slate-500">Order</dt>
          <dd className="font-medium">
            <Math tex={`|G| = ${group.order}`} />
          </dd>

          <dt className="text-slate-500">Kaleidoscope</dt>
          <dd className="font-medium">
            Schwarz <Math tex={schwarzSymbol(groupId, n)} />
            {polyhedral && (
              <>
                {' '}
                &middot; {triangles.length} chambers ({group.order} of each color)
              </>
            )}
          </dd>

          <dt className="text-slate-500">Presentation</dt>
          <dd className="font-medium">
            <Math tex={presentationTex(groupId, n)} />
          </dd>

          <dt className="text-slate-500">Solid</dt>
          <dd className="font-medium">
            {solidName(groupId)}
            {vef && (
              <>
                {' '}
                &middot; <Math tex={`${vef.v} - ${vef.e} + ${vef.f} = 2`} />
              </>
            )}
          </dd>

          <dt className="text-slate-500">Axes</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1 font-medium">
            {census.map((cls) => (
              <span key={cls.order} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: axisSwatch(cls.order) }}
                />
                {cls.axes.length} {foldName(cls.order)}
              </span>
            ))}
          </dd>
        </dl>
      </div>

      {/* Orbit-stabilizer lab */}
      <section className="mb-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Orbit and stabilizer
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          The green markers are the <em>orbit</em> of one seed point: every place the group can send
          it. Move the seed onto a symmetry axis and watch the orbit shrink &mdash; the more
          symmetric the spot, the larger its <em>stabilizer</em> (the rotations that fix it).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {presets.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPreset(option.id)}
              className={option.id === preset ? selected : unselected}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Math
            tex={`|G| = |\\mathrm{orbit}| \\times |\\mathrm{stab}| \\;\\Rightarrow\\; ${group.order} = ${orbitPoints.length} \\times ${stabilizer}`}
          />
        </p>
      </section>

      {/* Concept cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ConceptCard title="The Riemann sphere">
          Stereographic projection wraps the plane (plus a point at infinity) onto the sphere{' '}
          <Math tex="\hat{\mathbb{C}}" />. It is <em>conformal</em>: it preserves angles and sends
          circles to circles. That is why Mobius maps, the conformal motions of the sphere, are the
          natural home for these groups.
        </ConceptCard>

        <ConceptCard title="Every rotation is elliptic">
          A finite-order rotation has a real trace with{' '}
          <Math tex="\operatorname{tr}^2 \in [0, 4)" />, so as a Mobius transformation it is always{' '}
          <em>elliptic</em>. The shown generator has trace{' '}
          <Math tex={complexTex(trace.re, trace.im)} /> &mdash;{' '}
          <span className="text-indigo-600 dark:text-indigo-400">{classLabel(klass)}</span>.
        </ConceptCard>

        <ConceptCard title="Fundamental domains">
          The kaleidoscope cuts the sphere into <Math tex="2|G|" /> identical Schwarz triangles.
          Each is a copy of the quotient; the group permutes them simply transitively. Count the
          triangles of one color and you have counted <Math tex="|G|" /> itself.
        </ConceptCard>

        <ConceptCard title="Generators build everything">
          Two rotations suffice. The presentation <Math tex={presentationTex(groupId, n)} /> says:
          an <Math tex={schwarzSymbol(groupId, n)} /> triangle of rotations generates the whole
          group, with every relation forced by the geometry of the tiling.
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
