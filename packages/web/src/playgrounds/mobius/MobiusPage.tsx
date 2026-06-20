import { useMemo, useRef, useState, type PointerEvent } from 'react'

import { Math } from '../../components/Math'

import { SphereCanvas } from './components/SphereCanvas'
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
import { classLabel, complexTex, groupName, groupTex } from './tex'

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

/** A gentle starting tilt so the polytope reads as three-dimensional. */
const INITIAL_VIEW = quatMul(rotationQuat(X_AXIS, -0.45), rotationQuat(Y_AXIS, 0.5))

export function MobiusPage() {
  const [groupId, setGroupId] = useState<GroupId>('icosahedral')
  const [n, setN] = useState(5)
  const [view, setView] = useState<Quaternion>(INITIAL_VIEW)
  const drag = useRef<{ x: number; y: number } | null>(null)

  const group = useMemo(() => buildGroup(groupId, n), [groupId, n])
  const points = useMemo(() => orbit(group, group.seed), [group])
  const edges = useMemo(() => polytopeEdges(points), [points])

  const mobius = quatToMobius(representativeRotation(group))
  const trace = traceMobius(mobius)
  const klass = classifyMobius(mobius)

  const parametric = PARAMETRIC.has(groupId)

  function onPointerDown(event: PointerEvent<HTMLDivElement>): void {
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
    const delta = quatMul(rotationQuat(Y_AXIS, dx), rotationQuat(X_AXIS, dy))
    setView((current) => quatMul(delta, current))
  }

  function onPointerUp(): void {
    drag.current = null
  }

  return (
    <div className="py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Mobius &amp; Finite Groups</h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
          A Mobius transformation <Math tex="z \mapsto \frac{az + b}{cz + d}" /> is a conformal
          automorphism of the Riemann sphere <Math tex="\hat{\mathbb{C}}" />. Every <em>finite</em>{' '}
          subgroup of <Math tex="\mathrm{PSL}_2(\mathbb{C})" /> is a rotation group - the cyclic{' '}
          <Math tex="C_n" />, dihedral <Math tex="D_n" />, and polyhedral{' '}
          <Math tex="A_4, S_4, A_5" /> families. Pick one to see its orbit on the sphere; drag to
          spin it (itself an elliptic Mobius transformation).
        </p>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        {GROUP_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setGroupId(id)}
            className={
              id === groupId
                ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm'
                : 'rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900'
            }
          >
            {groupName(id)}
          </button>
        ))}
      </section>

      {parametric && (
        <section className="mb-6 flex flex-wrap items-center gap-2">
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

      <div className="flex flex-wrap items-start gap-8">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="cursor-grab touch-none rounded-xl border border-slate-200 bg-white p-2 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900"
        >
          <SphereCanvas points={points} edges={edges} view={view} size={360} />
        </div>

        <dl className="grid min-w-56 grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          <dt className="text-slate-500">Group</dt>
          <dd className="font-medium">
            <Math tex={groupTex(groupId, n)} />
          </dd>

          <dt className="text-slate-500">Order</dt>
          <dd className="font-medium">{group.order}</dd>

          <dt className="text-slate-500">Vertices</dt>
          <dd className="font-medium">{points.length}</dd>

          <dt className="text-slate-500">Edges</dt>
          <dd className="font-medium">{edges.length}</dd>

          <dt className="text-slate-500">Generator trace</dt>
          <dd className="font-medium">
            <Math tex={complexTex(trace.re, trace.im)} />
          </dd>

          <dt className="text-slate-500">Class</dt>
          <dd className="font-medium text-indigo-600 dark:text-indigo-400">{classLabel(klass)}</dd>
        </dl>
      </div>

      <p className="mt-6 max-w-2xl text-sm text-slate-500">
        Every non-identity element of a finite rotation group has finite order, so its trace is real
        with <Math tex="\operatorname{tr}^2 \in [0, 4)" /> - it is always <em>elliptic</em>. The
        hyperbolic and loxodromic classes appear only for transformations of infinite order.
      </p>
    </div>
  )
}
