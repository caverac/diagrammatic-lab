import { useEffect, useRef } from 'react'

import { projectSphere, type Quaternion, type Vec3 } from '../model'

/** A wireframe orbit on the sphere, drawn under a draggable viewing rotation. */
export interface SphereCanvasProps {
  readonly points: readonly Vec3[]
  readonly edges: readonly [number, number][]
  readonly view: Quaternion
  /** CSS pixel size of the (square) canvas. */
  readonly size: number
}

const ACCENT = '99, 102, 241' // indigo-500
const OUTLINE = '148, 163, 184' // slate-400

/** Alpha ramp from far (depth -1) to near (depth +1). */
function depthAlpha(depth: number): number {
  return 0.3 + 0.7 * ((depth + 1) / 2)
}

export function SphereCanvas({ points, edges, view, size }: SphereCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.42
    const projected = projectSphere(points, view)
    const sx = (i: number): number => cx + projected[i].x * radius
    const sy = (i: number): number => cy - projected[i].y * radius

    // The silhouette of the sphere.
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = `rgba(${OUTLINE}, 0.25)`
    ctx.lineWidth = 1
    ctx.stroke()

    // Edges, far ones first so near ones sit on top.
    const ordered = [...edges].sort(
      (e, f) =>
        (projected[e[0]].depth + projected[e[1]].depth) / 2 -
        (projected[f[0]].depth + projected[f[1]].depth) / 2
    )
    for (const [i, j] of ordered) {
      const alpha = depthAlpha((projected[i].depth + projected[j].depth) / 2)
      ctx.beginPath()
      ctx.moveTo(sx(i), sy(i))
      ctx.lineTo(sx(j), sy(j))
      ctx.strokeStyle = `rgba(${ACCENT}, ${0.25 + 0.45 * alpha})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Vertices, near ones last (drawn larger and brighter).
    const order = points.map((_, i) => i).sort((i, j) => projected[i].depth - projected[j].depth)
    for (const i of order) {
      const alpha = depthAlpha(projected[i].depth)
      ctx.beginPath()
      ctx.arc(sx(i), sy(i), 2 + 2.5 * ((projected[i].depth + 1) / 2), 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`
      ctx.fill()
    }
  }, [points, edges, view, size])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="touch-none" />
}
