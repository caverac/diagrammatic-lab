import { useEffect, useRef } from 'react'

import { rotateVec3, type Quaternion, type Vec3 } from '../model'
import { centroid3, type AxisClass, type SchwarzTriangle } from '../symmetry'

/**
 * The spherical kaleidoscope: the Schwarz-triangle tiling of a polyhedral group
 * rendered as a solid, shaded, two-colored ball, with the current orbit and
 * (optionally) the rotation axes overlaid. When there is no tiling (the cyclic
 * and dihedral families) it falls back to the orbit wireframe.
 */
export interface KaleidoscopeSphereProps {
  readonly triangles: readonly SchwarzTriangle[]
  readonly orbitPoints: readonly Vec3[]
  readonly edges: readonly [number, number][]
  readonly axes: readonly AxisClass[]
  readonly showAxes: boolean
  readonly view: Quaternion
  readonly size: number
}

const WHITE: [number, number, number] = [199, 210, 254] // indigo-200
const BLACK: [number, number, number] = [67, 56, 202] // indigo-700
const ORBIT: [number, number, number] = [16, 185, 129] // emerald-500
const OUTLINE = '148, 163, 184' // slate-400

/** A color per axis fold, so the census reads at a glance. */
function axisColor(order: number): string {
  if (order === 2) return '100, 116, 139' // slate-500
  if (order === 3) return '245, 158, 11' // amber-500
  return '244, 63, 94' // rose-500 for the principal (4-, 5-, n-fold) axis
}

function shade([r, g, b]: [number, number, number], intensity: number): string {
  return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`
}

export function KaleidoscopeSphere({
  triangles,
  orbitPoints,
  edges,
  axes,
  showAxes,
  view,
  size
}: KaleidoscopeSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.44
    const px = (v: Vec3): [number, number] => [cx + v.x * radius, cy - v.y * radius]

    // The sphere silhouette.
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.08)'
    ctx.fill()
    ctx.strokeStyle = `rgba(${OUTLINE}, 0.3)`
    ctx.lineWidth = 1
    ctx.stroke()

    if (triangles.length > 0) {
      // Front-facing kaleidoscope triangles, shaded by their facing.
      const faces = triangles
        .map((t) => {
          const v = t.vertices.map((p) => rotateVec3(view, p)) as [Vec3, Vec3, Vec3]
          const mid = centroid3(v[0], v[1], v[2])
          return { v, depth: mid.z, color: t.orientation === 1 ? WHITE : BLACK }
        })
        .filter((f) => f.depth > 0)
        .sort((a, b) => a.depth - b.depth)

      for (const f of faces) {
        const intensity = 0.55 + 0.45 * Math.min(1, f.depth)
        ctx.beginPath()
        ctx.moveTo(...px(f.v[0]))
        ctx.lineTo(...px(f.v[1]))
        ctx.lineTo(...px(f.v[2]))
        ctx.closePath()
        ctx.fillStyle = shade(f.color, intensity)
        ctx.fill()
        ctx.strokeStyle = 'rgba(30, 27, 75, 0.3)'
        ctx.lineWidth = 0.6
        ctx.stroke()
      }
    } else {
      // Cyclic / dihedral: draw the orbit polytope as a wireframe.
      const projected = orbitPoints.map((p) => rotateVec3(view, p))
      for (const [i, j] of edges) {
        ctx.beginPath()
        ctx.moveTo(...px(projected[i]))
        ctx.lineTo(...px(projected[j]))
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // Rotation axes, as chords colored by fold.
    if (showAxes) {
      for (const klass of axes) {
        ctx.strokeStyle = `rgba(${axisColor(klass.order)}, 0.85)`
        ctx.lineWidth = 1.25
        for (const axis of klass.axes) {
          const a = rotateVec3(view, axis)
          const b = { x: -a.x, y: -a.y, z: -a.z }
          ctx.beginPath()
          ctx.moveTo(...px(a))
          ctx.lineTo(...px(b))
          ctx.stroke()
        }
      }
    }

    // The current orbit, as bright markers (front hemisphere emphasised).
    const orbit = orbitPoints.map((p) => rotateVec3(view, p)).sort((a, b) => a.z - b.z)
    for (const p of orbit) {
      const near = (p.z + 1) / 2
      ctx.beginPath()
      ctx.arc(...px(p), 2.5 + 3 * near, 0, 2 * Math.PI)
      ctx.fillStyle = shade(ORBIT, 0.5 + 0.5 * near)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [triangles, orbitPoints, edges, axes, showAxes, view, size])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="touch-none" />
}
