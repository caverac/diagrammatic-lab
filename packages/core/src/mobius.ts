/**
 * The framework-independent view-model for the Mobius playground.
 *
 * A Mobius transformation `z |-> (az + b)/(cz + d)` (with `ad - bc != 0`) is exactly
 * an orientation-preserving conformal automorphism of the Riemann sphere
 * `C-hat = C union {infinity}`, i.e. an element of `PSL_2(C)`. By a classical theorem of Klein,
 * every *finite* subgroup of `PSL_2(C)` is conjugate to a group of rotations of
 * the sphere - so the complete list is the cyclic groups `C_n`, the dihedral
 * groups `D_n`, and the three polyhedral groups `A_4` (tetrahedral), `S_4`
 * (octahedral) and `A_5` (icosahedral).
 *
 * This module is pure data and arithmetic - no DOM - so the React layer stays
 * thin and every line here is unit-tested. We carry rotations as unit
 * quaternions (the double cover `SU(2) -> SO(3)`); the same quaternion yields
 * both a rotation of the sphere (for the 3-D orbit) and an `SU(2)` Mobius matrix
 * (for the trace-based classification).
 */

// -----------------------------------------------------------------------------
// Complex numbers
// -----------------------------------------------------------------------------

/** A complex number `re + im.i`. */
export interface Complex {
  readonly re: number
  readonly im: number
}

/** Construct a complex number. */
export function complex(re: number, im: number): Complex {
  return { re, im }
}

/** Complex addition. */
export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

/** Complex subtraction. */
export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im }
}

/** Complex multiplication. */
export function cMul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
}

/** Modulus `|z|`. */
export function cAbs(z: Complex): number {
  return Math.hypot(z.re, z.im)
}

/** Complex division `a / b` (caller guarantees `b != 0`). */
export function cDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im
  return { re: (a.re * b.re + a.im * b.im) / denom, im: (a.im * b.re - a.re * b.im) / denom }
}

// -----------------------------------------------------------------------------
// Mobius transformations as 2x2 complex matrices
// -----------------------------------------------------------------------------

/** A Mobius transformation, carried as the matrix `[[a, b], [c, d]]`. */
export interface Mobius {
  readonly a: Complex
  readonly b: Complex
  readonly c: Complex
  readonly d: Complex
}

/** Construct a Mobius transformation from its four matrix entries. */
export function mobius(a: Complex, b: Complex, c: Complex, d: Complex): Mobius {
  return { a, b, c, d }
}

/** The determinant `ad - bc`. */
export function detMobius(m: Mobius): Complex {
  return cSub(cMul(m.a, m.d), cMul(m.b, m.c))
}

/** The trace `a + d`. */
export function traceMobius(m: Mobius): Complex {
  return cAdd(m.a, m.d)
}

/** Composition `m o n`, i.e. ordinary matrix multiplication. */
export function composeMobius(m: Mobius, n: Mobius): Mobius {
  return {
    a: cAdd(cMul(m.a, n.a), cMul(m.b, n.c)),
    b: cAdd(cMul(m.a, n.b), cMul(m.b, n.d)),
    c: cAdd(cMul(m.c, n.a), cMul(m.d, n.c)),
    d: cAdd(cMul(m.c, n.b), cMul(m.d, n.d))
  }
}

/**
 * Apply a Mobius transformation to an extended-complex point, where `null`
 * denotes the point at infinity. Sends `infinity |-> a/c` and the pole `-d/c |-> infinity`.
 */
export function applyMobius(m: Mobius, z: Complex | null): Complex | null {
  if (z === null) {
    return cAbs(m.c) < EPS ? null : cDiv(m.a, m.c)
  }
  const denom = cAdd(cMul(m.c, z), m.d)
  if (cAbs(denom) < EPS) {
    return null
  }
  return cDiv(cAdd(cMul(m.a, z), m.b), denom)
}

/** The conjugacy class of a non-identity Mobius transformation. */
export type MobiusClass = 'identity' | 'elliptic' | 'parabolic' | 'hyperbolic' | 'loxodromic'

/**
 * Classify a Mobius transformation by the scaling-invariant trace ratio
 * `beta = tr^2 / det`:
 *
 * - `beta = 4` -> parabolic, `beta in [0, 4)` -> elliptic, `beta in (4, infinity)` -> hyperbolic
 *   (all with `beta` real), and everything else (complex `beta`, or real `beta < 0`) ->
 *   loxodromic.
 *
 * The identity is detected first. Throws if the transformation is degenerate
 * (`det ~= 0`), since such a matrix is not a Mobius transformation.
 */
export function classifyMobius(m: Mobius): MobiusClass {
  const det = detMobius(m)
  if (cAbs(det) < EPS) {
    throw new RangeError('degenerate Mobius transformation: determinant is zero')
  }
  if (cAbs(m.b) < EPS && cAbs(m.c) < EPS && cAbs(cSub(m.a, m.d)) < EPS) {
    return 'identity'
  }
  const tr = traceMobius(m)
  const beta = cDiv(cMul(tr, tr), det)
  if (Math.abs(beta.im) > EPS) {
    return 'loxodromic'
  }
  if (Math.abs(beta.re - 4) < EPS) {
    return 'parabolic'
  }
  if (beta.re >= 0 && beta.re < 4) {
    return 'elliptic'
  }
  if (beta.re > 4) {
    return 'hyperbolic'
  }
  return 'loxodromic'
}

// -----------------------------------------------------------------------------
// 3-D vectors and quaternions
// -----------------------------------------------------------------------------

/** A point in `R^3`. */
export interface Vec3 {
  readonly x: number
  readonly y: number
  readonly z: number
}

/** Construct a 3-vector. */
export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z }
}

/** Return `v` scaled to unit length (caller guarantees `v != 0`). */
export function normalizeVec3(v: Vec3): Vec3 {
  const r = Math.hypot(v.x, v.y, v.z)
  return { x: v.x / r, y: v.y / r, z: v.z / r }
}

/** A quaternion `w + xi + yj + zk`. */
export interface Quaternion {
  readonly w: number
  readonly x: number
  readonly y: number
  readonly z: number
}

/** Construct a quaternion. */
export function quat(w: number, x: number, y: number, z: number): Quaternion {
  return { w, x, y, z }
}

/** Hamilton product `p . q`. */
export function quatMul(p: Quaternion, q: Quaternion): Quaternion {
  return {
    w: p.w * q.w - p.x * q.x - p.y * q.y - p.z * q.z,
    x: p.w * q.x + p.x * q.w + p.y * q.z - p.z * q.y,
    y: p.w * q.y - p.x * q.z + p.y * q.w + p.z * q.x,
    z: p.w * q.z + p.x * q.y - p.y * q.x + p.z * q.w
  }
}

/** Conjugate `w - xi - yj - zk` (the inverse, for a unit quaternion). */
export function quatConj(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z }
}

/** The unit quaternion for a rotation by `angle` about a unit `axis`. */
export function rotationQuat(axis: Vec3, angle: number): Quaternion {
  const h = angle / 2
  const s = Math.sin(h)
  return { w: Math.cos(h), x: axis.x * s, y: axis.y * s, z: axis.z * s }
}

/** Rotate a 3-vector by a unit quaternion, via `q . v . q^-1`. */
export function rotateVec3(q: Quaternion, v: Vec3): Vec3 {
  const p: Quaternion = { w: 0, x: v.x, y: v.y, z: v.z }
  const r = quatMul(quatMul(q, p), quatConj(q))
  return { x: r.x, y: r.y, z: r.z }
}

/**
 * The `SU(2)` Mobius matrix of a unit quaternion `q = w + xi + yj + zk`, namely
 * `[[w + xi, y + zi], [-y + zi, w - xi]]`. Its determinant is `|q|^2 = 1`, so the
 * transformation is always elliptic - the Mobius shadow of a sphere rotation.
 */
export function quatToMobius(q: Quaternion): Mobius {
  return {
    a: complex(q.w, q.x),
    b: complex(q.y, q.z),
    c: complex(-q.y, q.z),
    d: complex(q.w, -q.x)
  }
}

// -----------------------------------------------------------------------------
// Stereographic projection  C-hat <-> S^2
// -----------------------------------------------------------------------------

/**
 * Stereographic projection from the north pole `(0, 0, 1)`: a sphere point
 * `(x, y, z)` maps to `(x + iy)/(1 - z)`, with the pole itself going to `infinity`
 * (returned as `null`).
 */
export function sphereToPlane(v: Vec3): Complex | null {
  if (Math.abs(1 - v.z) < EPS) {
    return null
  }
  return complex(v.x / (1 - v.z), v.y / (1 - v.z))
}

/** The inverse stereographic projection, sending `infinity` (`null`) to the pole. */
export function planeToSphere(z: Complex | null): Vec3 {
  if (z === null) {
    return { x: 0, y: 0, z: 1 }
  }
  const d = z.re * z.re + z.im * z.im + 1
  return { x: (2 * z.re) / d, y: (2 * z.im) / d, z: (d - 2) / d }
}

// -----------------------------------------------------------------------------
// Finite subgroups of the rotation group
// -----------------------------------------------------------------------------

const EPS = 1e-9

/** The golden ratio `phi = (1 + sqrt(5))/2`, the heart of icosahedral symmetry. */
export const PHI = (1 + Math.sqrt(5)) / 2

/** A signed-key resolution for folding the double cover `+-q` to one rotation. */
const KEY_PLACES = 6
const KEY_SCALE = 10 ** KEY_PLACES

/**
 * Round a coordinate to a canonical key token, snapping `-+0` float noise to a
 * single `'0'` - `toFixed` alone keeps the sign, so a tiny negative would not
 * match its tiny-positive twin.
 */
function quantize(value: number): string {
  const rounded = Math.round(value * KEY_SCALE) / KEY_SCALE
  return rounded === 0 ? '0' : rounded.toFixed(KEY_PLACES)
}

/**
 * A canonical string key for the *rotation* a unit quaternion represents. Since
 * `q` and `-q` give the same rotation, we fix the sign by the first significant
 * component, then round - so `q` and `-q` collapse to one key.
 */
function rotationKey(q: Quaternion): string {
  const parts = [q.w, q.x, q.y, q.z]
  let sign = 1
  for (const p of parts) {
    if (Math.abs(p) > EPS) {
      sign = p < 0 ? -1 : 1
      break
    }
  }
  return parts.map((p) => quantize(sign * p)).join(',')
}

/**
 * Close a set of rotation generators into the finite group they generate,
 * returned as one quaternion per rotation (the double cover `+-q` is folded).
 */
function closure(generators: readonly Quaternion[]): Quaternion[] {
  const identityQ = quat(1, 0, 0, 0)
  const byKey = new Map<string, Quaternion>([[rotationKey(identityQ), identityQ]])
  let frontier: Quaternion[] = [identityQ]
  while (frontier.length > 0) {
    const next: Quaternion[] = []
    for (const g of frontier) {
      for (const gen of generators) {
        const product = quatMul(g, gen)
        const key = rotationKey(product)
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

/**
 * The 120 unit quaternions of the binary icosahedral group (the icosians): the
 * 8 with a single `+-1`, the 16 of the form `(+-1/2, +-1/2, +-1/2, +-1/2)`, and the 96 even
 * permutations of `(0, +-1, +-1/phi, +-phi)/2`.
 */
function icosianQuaternions(): Quaternion[] {
  const result: Quaternion[] = []
  const tuples: number[][] = []

  // 8: one +-1 in each slot.
  for (let i = 0; i < 4; i += 1) {
    for (const s of [1, -1]) {
      const t = [0, 0, 0, 0]
      t[i] = s
      tuples.push(t)
    }
  }
  // 16: all (+-1/2, +-1/2, +-1/2, +-1/2).
  for (let mask = 0; mask < 16; mask += 1) {
    tuples.push([0, 1, 2, 3].map((b) => ((mask >> b) & 1 ? 0.5 : -0.5)))
  }
  // 96: even permutations of (0, +-1, +-1/phi, +-phi)/2, signing the three nonzeros.
  const base = [0, 0.5, 0.5 / PHI, 0.5 * PHI]
  for (const perm of EVEN_PERMUTATIONS_4) {
    for (let mask = 0; mask < 8; mask += 1) {
      const signs = [1, mask & 1 ? 1 : -1, mask & 2 ? 1 : -1, mask & 4 ? 1 : -1]
      tuples.push(perm.map((p, i) => base[p] * signs[i]))
    }
  }

  for (const [w, x, y, z] of tuples) {
    result.push(quat(w, x, y, z))
  }
  return result
}

/** The 12 even permutations of `(0, 1, 2, 3)`, as index lists. */
const EVEN_PERMUTATIONS_4: readonly (readonly number[])[] = [
  [0, 1, 2, 3],
  [0, 2, 3, 1],
  [0, 3, 1, 2],
  [1, 0, 3, 2],
  [1, 2, 0, 3],
  [1, 3, 2, 0],
  [2, 0, 1, 3],
  [2, 1, 3, 0],
  [2, 3, 0, 1],
  [3, 0, 2, 1],
  [3, 1, 0, 2],
  [3, 2, 1, 0]
]

/** Fold a list of quaternions to one representative per distinct rotation. */
function dedupRotations(quaternions: readonly Quaternion[]): Quaternion[] {
  const byKey = new Map<string, Quaternion>()
  for (const q of quaternions) {
    byKey.set(rotationKey(q), q)
  }
  return [...byKey.values()]
}

/** The five families of finite rotation groups, keyed by id. */
export type GroupId = 'cyclic' | 'dihedral' | 'tetrahedral' | 'octahedral' | 'icosahedral'

/** A finite rotation group, with its elements as quaternions. */
export interface FiniteGroup {
  readonly id: GroupId
  /** The order `|G|` (number of distinct rotations). */
  readonly order: number
  /** One unit quaternion per rotation. */
  readonly elements: readonly Quaternion[]
  /** A seed on `S^2` whose orbit is a recognizable polytope. */
  readonly seed: Vec3
}

const Z_AXIS = vec3(0, 0, 1)
const X_AXIS = vec3(1, 0, 0)
const DIAGONAL = normalizeVec3(vec3(1, 1, 1))

/**
 * Build a finite rotation group. For the cyclic and dihedral families pass the
 * order parameter `n` (default 5); the polyhedral families ignore it.
 */
export function buildGroup(id: GroupId, n = 5): FiniteGroup {
  let elements: Quaternion[]
  let seed: Vec3
  switch (id) {
    case 'cyclic':
      elements = closure([rotationQuat(Z_AXIS, (2 * Math.PI) / n)])
      seed = normalizeVec3(vec3(Math.sin(0.6), 0, Math.cos(0.6)))
      break
    case 'dihedral':
      elements = closure([rotationQuat(Z_AXIS, (2 * Math.PI) / n), rotationQuat(X_AXIS, Math.PI)])
      seed = normalizeVec3(vec3(Math.sin(0.6), 0, Math.cos(0.6)))
      break
    case 'tetrahedral':
      elements = closure([rotationQuat(DIAGONAL, (2 * Math.PI) / 3), rotationQuat(Z_AXIS, Math.PI)])
      seed = DIAGONAL
      break
    case 'octahedral':
      elements = closure([
        rotationQuat(Z_AXIS, Math.PI / 2),
        rotationQuat(DIAGONAL, (2 * Math.PI) / 3)
      ])
      seed = Z_AXIS
      break
    default:
      elements = dedupRotations(icosianQuaternions())
      seed = normalizeVec3(vec3(0, 1, PHI))
      break
  }
  return { id, order: elements.length, elements, seed }
}

/** Whether a unit quaternion is the identity rotation (`+-1`). */
export function isIdentityRotation(q: Quaternion): boolean {
  return Math.abs(Math.abs(q.w) - 1) < EPS
}

/**
 * A non-identity generator to showcase (its Mobius shadow is always elliptic),
 * falling back to the identity for the trivial group `C_1`.
 */
export function representativeRotation(group: FiniteGroup): Quaternion {
  return group.elements.find((q) => !isIdentityRotation(q)) ?? group.elements[0]
}

// -----------------------------------------------------------------------------
// Orbits, polytope edges, and projection (the render plan)
// -----------------------------------------------------------------------------

/** A rounding key for a sphere point, used to dedup an orbit. */
function pointKey(v: Vec3): string {
  return [v.x, v.y, v.z].map(quantize).join(',')
}

/** The orbit of a seed point under a group: the distinct images on `S^2`. */
export function orbit(group: FiniteGroup, seed: Vec3): Vec3[] {
  const byKey = new Map<string, Vec3>()
  for (const q of group.elements) {
    const p = rotateVec3(q, seed)
    const key = pointKey(p)
    if (!byKey.has(key)) {
      byKey.set(key, p)
    }
  }
  return [...byKey.values()]
}

/**
 * The edges of the convex polytope spanned by a vertex-transitive orbit: every
 * pair of points separated by the *minimum* pairwise distance. Returned as
 * index pairs `[i, j]` with `i < j`.
 */
export function polytopeEdges(points: readonly Vec3[]): [number, number][] {
  let min = Infinity
  const dist = (a: Vec3, b: Vec3): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const d = dist(points[i], points[j])
      if (d < min) {
        min = d
      }
    }
  }
  const edges: [number, number][] = []
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      if (Math.abs(dist(points[i], points[j]) - min) < 1e-6) {
        edges.push([i, j])
      }
    }
  }
  return edges
}

/** A sphere point projected to the drawing plane, with depth for painter order. */
export interface ProjectedPoint {
  readonly x: number
  readonly y: number
  /** The viewer-facing depth in `[-1, 1]`; larger is nearer the camera. */
  readonly depth: number
}

/**
 * Orthographically project orbit points after applying a viewing rotation:
 * rotate by `view`, then read off `(x, y)` with `z` as depth. This is what the
 * canvas draws; dragging updates `view` to spin the sphere - itself a
 * one-parameter family of elliptic Mobius transformations.
 */
export function projectSphere(points: readonly Vec3[], view: Quaternion): ProjectedPoint[] {
  return points.map((p) => {
    const r = rotateVec3(view, p)
    return { x: r.x, y: r.y, depth: r.z }
  })
}
