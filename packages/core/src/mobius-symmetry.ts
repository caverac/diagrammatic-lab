/**
 * Symmetry structure of the finite rotation groups: rotation axes, the full
 * reflection group, the Schwarz-triangle kaleidoscope tiling, and the
 * orbit-stabilizer data the playground uses to teach group actions.
 *
 * Everything here is pure and unit-tested. Correctness is pinned by counts:
 * the kaleidoscope must produce 24 / 48 / 120 triangles for the tetrahedral /
 * octahedral / icosahedral groups, and the axis census must reproduce the
 * classical tallies (e.g. the icosahedral group has 6 five-fold, 10 three-fold,
 * and 15 two-fold axes).
 */

import {
  isIdentityRotation,
  normalizeVec3,
  orbit,
  PHI,
  quatMul,
  vec3,
  type FiniteGroup,
  type GroupId,
  type Quaternion,
  type Vec3
} from '@core/mobius'

const EPS = 1e-9
const KEY_PLACES = 6
const KEY_SCALE = 10 ** KEY_PLACES

/** Round a number to a canonical key token, snapping signed-zero noise to '0'. */
function quantize(value: number): string {
  const rounded = Math.round(value * KEY_SCALE) / KEY_SCALE
  return rounded === 0 ? '0' : rounded.toFixed(KEY_PLACES)
}

// -----------------------------------------------------------------------------
// 3-vector helpers
// -----------------------------------------------------------------------------

/** The cross product `a x b`. */
export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

/** The arithmetic mean of three vectors (a triangle centroid). */
export function centroid3(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3, z: (a.z + b.z + c.z) / 3 }
}

/** A canonical key for an undirected axis (a line through the origin). */
function axisLineKey(axis: Vec3): string {
  const parts = [axis.x, axis.y, axis.z]
  let sign = 1
  for (const p of parts) {
    if (Math.abs(p) > EPS) {
      sign = p < 0 ? -1 : 1
      break
    }
  }
  return parts.map((p) => quantize(sign * p)).join(',')
}

// -----------------------------------------------------------------------------
// 3x3 matrices (the full reflection group lives here)
// -----------------------------------------------------------------------------

/** A 3x3 matrix in row-major order. */
export type Mat3 = readonly number[]

/** The 3x3 identity. */
export const MAT3_IDENTITY: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/** Matrix product `a * b`. */
export function mat3Mul(a: Mat3, b: Mat3): Mat3 {
  const out: number[] = []
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      let sum = 0
      for (let k = 0; k < 3; k += 1) {
        sum += a[row * 3 + k] * b[k * 3 + col]
      }
      out.push(sum)
    }
  }
  return out
}

/** Apply a matrix to a vector. */
export function mat3Apply(m: Mat3, v: Vec3): Vec3 {
  return {
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
    y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
    z: m[6] * v.x + m[7] * v.y + m[8] * v.z
  }
}

/** The determinant: `+1` for a rotation, `-1` for a reflection. */
export function mat3Det(m: Mat3): number {
  return (
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6])
  )
}

/** The reflection across the plane through the origin with unit normal `n`. */
export function reflectionMatrix(n: Vec3): Mat3 {
  const { x, y, z } = n
  return [
    1 - 2 * x * x,
    -2 * x * y,
    -2 * x * z,
    -2 * x * y,
    1 - 2 * y * y,
    -2 * y * z,
    -2 * x * z,
    -2 * y * z,
    1 - 2 * z * z
  ]
}

/** The rotation matrix of a unit quaternion. */
export function rotationMatrix(q: Quaternion): Mat3 {
  const { w, x, y, z } = q
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y - w * z),
    2 * (x * z + w * y),
    2 * (x * y + w * z),
    1 - 2 * (x * x + z * z),
    2 * (y * z - w * x),
    2 * (x * z - w * y),
    2 * (y * z + w * x),
    1 - 2 * (x * x + y * y)
  ]
}

/** A canonical key for a matrix, for de-duplication during closure. */
function mat3Key(m: Mat3): string {
  return m.map(quantize).join(',')
}

/**
 * Close a set of orthogonal generators into the finite group they generate.
 * Used with reflections to build a full polyhedral symmetry group.
 */
export function reflectionGroupClosure(generators: readonly Mat3[]): Mat3[] {
  const byKey = new Map<string, Mat3>([[mat3Key(MAT3_IDENTITY), MAT3_IDENTITY]])
  let frontier: Mat3[] = [MAT3_IDENTITY]
  while (frontier.length > 0) {
    const next: Mat3[] = []
    for (const g of frontier) {
      for (const gen of generators) {
        const product = mat3Mul(g, gen)
        const key = mat3Key(product)
        if (!byKey.has(key)) {
          byKey.set(key, product)
          next.push(product)
        }
      }
    }
    frontier = next
  }
  return [...byKey.values()]
}

// -----------------------------------------------------------------------------
// Rotation axes and the conjugacy census
// -----------------------------------------------------------------------------

/** The axis (a unit vector) of a non-identity rotation, or null for the identity. */
export function axisOfRotation(q: Quaternion): Vec3 | null {
  const s = Math.hypot(q.x, q.y, q.z)
  if (s < EPS) {
    return null
  }
  return { x: q.x / s, y: q.y / s, z: q.z / s }
}

/**
 * The order of a rotation as a group element: the least `m` with `q^m` the
 * identity rotation. `max` bounds the search (the group order suffices).
 */
export function elementOrder(q: Quaternion, max: number): number {
  let p = q
  for (let m = 1; m <= max; m += 1) {
    if (isIdentityRotation(p)) {
      return m
    }
    p = quatMul(p, q)
  }
  return max
}

/** A family of rotation axes that share the same fold (rotation order). */
export interface AxisClass {
  /** The fold: 2 for a two-fold axis, 3 for three-fold, and so on. */
  readonly order: number
  /** One representative direction per distinct axis line. */
  readonly axes: readonly Vec3[]
}

/**
 * Group the rotation axes of `group` by their fold (the maximal order of a
 * rotation about each axis), sorted from highest fold to lowest. For the
 * icosahedral group this yields five-fold (6 axes), three-fold (10), and
 * two-fold (15).
 */
export function axisCensus(group: FiniteGroup): AxisClass[] {
  const byLine = new Map<string, { axis: Vec3; order: number }>()
  for (const q of group.elements) {
    const axis = axisOfRotation(q)
    if (axis === null) {
      continue
    }
    const order = elementOrder(q, group.order)
    const key = axisLineKey(axis)
    const seen = byLine.get(key)
    if (seen === undefined) {
      byLine.set(key, { axis, order })
    } else {
      seen.order = Math.max(seen.order, order)
    }
  }

  const byOrder = new Map<number, Vec3[]>()
  for (const { axis, order } of byLine.values()) {
    const list = byOrder.get(order)
    if (list === undefined) {
      byOrder.set(order, [axis])
    } else {
      list.push(axis)
    }
  }

  return [...byOrder.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([order, axes]) => ({ order, axes }))
}

// -----------------------------------------------------------------------------
// The Schwarz-triangle kaleidoscope
// -----------------------------------------------------------------------------

/** One spherical triangle of a kaleidoscope, tagged by orientation. */
export interface SchwarzTriangle {
  readonly vertices: readonly [Vec3, Vec3, Vec3]
  /** `+1` for a rotation image, `-1` for a mirror image (the two-coloring). */
  readonly orientation: 1 | -1
}

/**
 * The three corners of one fundamental Schwarz triangle for a polyhedral group:
 * a vertex (n-fold axis), an edge midpoint (two-fold), and a face center
 * (three-fold) of the associated solid. Returns null for the cyclic and
 * dihedral families, which have no polyhedral kaleidoscope.
 */
export function schwarzCorners(id: GroupId): [Vec3, Vec3, Vec3] | null {
  switch (id) {
    case 'tetrahedral':
      return [normalizeVec3(vec3(1, 1, 1)), vec3(1, 0, 0), normalizeVec3(vec3(1, 1, -1))]
    case 'octahedral':
      return [vec3(1, 0, 0), normalizeVec3(vec3(1, 1, 0)), normalizeVec3(vec3(1, 1, 1))]
    case 'icosahedral':
      return [
        normalizeVec3(vec3(0, 1, PHI)),
        normalizeVec3(vec3(1, 1 + PHI, PHI)),
        normalizeVec3(vec3(0, 1 + 2 * PHI, PHI))
      ]
    default:
      return null
  }
}

/**
 * The full Schwarz-triangle tiling of the sphere for a polyhedral group, built
 * by reflecting one fundamental triangle in its three sides. Two-colored by
 * orientation, the tiling has `2|G|` triangles. Returns an empty list for the
 * cyclic and dihedral families.
 */
export function schwarzTiling(group: FiniteGroup): SchwarzTriangle[] {
  const corners = schwarzCorners(group.id)
  if (corners === null) {
    return []
  }
  const [a, b, c] = corners
  const generators = [
    reflectionMatrix(normalizeVec3(crossVec3(b, c))),
    reflectionMatrix(normalizeVec3(crossVec3(c, a))),
    reflectionMatrix(normalizeVec3(crossVec3(a, b)))
  ]
  return reflectionGroupClosure(generators).map((m) => ({
    vertices: [mat3Apply(m, a), mat3Apply(m, b), mat3Apply(m, c)] as [Vec3, Vec3, Vec3],
    orientation: mat3Det(m) > 0 ? 1 : -1
  }))
}

// -----------------------------------------------------------------------------
// Orbit-stabilizer playground data
// -----------------------------------------------------------------------------

/** A choice of seed point for the orbit-stabilizer demonstration. */
export type SeedPreset = 'generic' | 'vertex' | 'edge' | 'face'

/** A generic direction, on no symmetry axis, so its orbit is all of `G`. */
const GENERIC_SEED = normalizeVec3(vec3(0.123, 0.456, 0.789))
const POLE = vec3(0, 0, 1)

/**
 * The seed direction for a preset. For polyhedral groups the special presets
 * sit on the n-fold, two-fold, and three-fold axes (vertex, edge, face); for
 * the cyclic and dihedral families only the pole and the generic seed differ.
 */
export function seedFor(id: GroupId, preset: SeedPreset): Vec3 {
  if (preset === 'generic') {
    return GENERIC_SEED
  }
  const corners = schwarzCorners(id)
  if (corners === null) {
    return preset === 'vertex' ? POLE : GENERIC_SEED
  }
  const [vertex, edge, face] = corners
  if (preset === 'vertex') {
    return vertex
  }
  return preset === 'edge' ? edge : face
}

/**
 * The stabilizer order of a seed: `|G| / |orbit|` by the orbit-stabilizer
 * theorem. A generic seed has trivial stabilizer; an axis seed has a cyclic
 * stabilizer of order equal to the axis fold.
 */
export function stabilizerOrder(group: FiniteGroup, seed: Vec3): number {
  return group.order / orbit(group, seed).length
}

// -----------------------------------------------------------------------------
// The associated solid
// -----------------------------------------------------------------------------

/** Vertex / edge / face counts of a polyhedron (for Euler's formula). */
export interface PolyhedronVEF {
  readonly v: number
  readonly e: number
  readonly f: number
}

/**
 * The vertex, edge, and face counts of the Platonic solid whose rotations form
 * the group (the octahedron for the octahedral group, the icosahedron for the
 * icosahedral group). Null for the cyclic and dihedral families.
 */
export function polyhedronVEF(id: GroupId): PolyhedronVEF | null {
  switch (id) {
    case 'tetrahedral':
      return { v: 4, e: 6, f: 4 }
    case 'octahedral':
      return { v: 6, e: 12, f: 8 }
    case 'icosahedral':
      return { v: 12, e: 30, f: 20 }
    default:
      return null
  }
}
