import {
  buildGroup,
  normalizeVec3,
  orbit,
  quat,
  rotationQuat,
  vec3,
  type GroupId
} from '../src/mobius'
import {
  axisCensus,
  axisOfRotation,
  centroid3,
  crossVec3,
  elementOrder,
  mat3Apply,
  mat3Det,
  mat3Mul,
  MAT3_IDENTITY,
  polyhedronVEF,
  reflectionGroupClosure,
  reflectionMatrix,
  rotationMatrix,
  schwarzCorners,
  schwarzTiling,
  seedFor,
  stabilizerOrder
} from '../src/mobius-symmetry'

/** Map an axis census to a plain `{ fold: count }` object for easy assertions. */
function censusCounts(id: GroupId, n?: number): Record<number, number> {
  const out: Record<number, number> = {}
  for (const klass of axisCensus(buildGroup(id, n))) {
    out[klass.order] = klass.axes.length
  }
  return out
}

describe('vector helpers', () => {
  it('crosses and averages vectors', () => {
    expect(crossVec3(vec3(1, 0, 0), vec3(0, 1, 0))).toEqual(vec3(0, 0, 1))
    expect(centroid3(vec3(3, 0, 0), vec3(0, 3, 0), vec3(0, 0, 3))).toEqual(vec3(1, 1, 1))
  })
})

describe('3x3 matrices', () => {
  it('multiplies, applies, and takes determinants', () => {
    expect(mat3Mul(MAT3_IDENTITY, MAT3_IDENTITY)).toEqual(MAT3_IDENTITY)
    expect(mat3Apply(MAT3_IDENTITY, vec3(2, 3, 5))).toEqual(vec3(2, 3, 5))
    expect(mat3Det(MAT3_IDENTITY)).toBe(1)
  })

  it('builds reflections (det -1) and rotations (det +1)', () => {
    const reflect = reflectionMatrix(vec3(1, 0, 0))
    expect(mat3Apply(reflect, vec3(1, 2, 3))).toEqual(vec3(-1, 2, 3))
    expect(mat3Det(reflect)).toBeCloseTo(-1)

    const rot = rotationMatrix(quat(0, 0, 0, 1)) // 180 degrees about z
    const turned = mat3Apply(rot, vec3(1, 0, 0))
    expect(turned.x).toBeCloseTo(-1)
    expect(turned.y).toBeCloseTo(0)
    expect(mat3Det(rot)).toBeCloseTo(1)
  })

  it('closes a reflection pair into a finite group', () => {
    const group = reflectionGroupClosure([reflectionMatrix(vec3(1, 0, 0)), MAT3_IDENTITY])
    expect(group.length).toBe(2)
  })
})

describe('rotation axes', () => {
  it('reads the axis of a rotation, and none for the identity', () => {
    expect(axisOfRotation(quat(1, 0, 0, 0))).toBeNull()
    const axis = axisOfRotation(rotationQuat(vec3(0, 0, 1), Math.PI / 2))
    expect(axis?.z).toBeCloseTo(1)
  })

  it('computes the order of a rotation, with a bounded search', () => {
    expect(elementOrder(quat(1, 0, 0, 0), 5)).toBe(1)
    expect(elementOrder(rotationQuat(vec3(0, 0, 1), (2 * Math.PI) / 3), 12)).toBe(3)
    // A search bound below the true order returns the bound.
    expect(elementOrder(rotationQuat(vec3(0, 0, 1), (2 * Math.PI) / 3), 1)).toBe(1)
  })

  it('reproduces the classical axis censuses', () => {
    expect(censusCounts('icosahedral')).toEqual({ 5: 6, 3: 10, 2: 15 })
    expect(censusCounts('octahedral')).toEqual({ 4: 3, 3: 4, 2: 6 })
    expect(censusCounts('tetrahedral')).toEqual({ 3: 4, 2: 3 })
    expect(censusCounts('cyclic', 5)).toEqual({ 5: 1 })
    expect(censusCounts('dihedral', 5)).toEqual({ 5: 1, 2: 5 })
  })

  it('orders the census from highest fold to lowest', () => {
    expect(axisCensus(buildGroup('icosahedral')).map((k) => k.order)).toEqual([5, 3, 2])
  })
})

describe('Schwarz kaleidoscope', () => {
  it('gives fundamental corners for polyhedral groups only', () => {
    expect(schwarzCorners('cyclic')).toBeNull()
    const corners = schwarzCorners('icosahedral')
    expect(corners).not.toBeNull()
    for (const v of corners ?? []) {
      expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(1)
    }
  })

  it('tiles the sphere into 2|G| two-colored triangles', () => {
    const cases: [GroupId, number][] = [
      ['tetrahedral', 24],
      ['octahedral', 48],
      ['icosahedral', 120]
    ]
    for (const [id, total] of cases) {
      const tiling = schwarzTiling(buildGroup(id))
      expect(tiling).toHaveLength(total)
      const white = tiling.filter((t) => t.orientation === 1).length
      const black = tiling.filter((t) => t.orientation === -1).length
      expect(white).toBe(total / 2)
      expect(black).toBe(total / 2)
    }
  })

  it('has no kaleidoscope for the cyclic and dihedral families', () => {
    expect(schwarzTiling(buildGroup('cyclic', 5))).toEqual([])
  })
})

describe('orbit-stabilizer', () => {
  it('chooses seeds for each preset', () => {
    const generic = seedFor('icosahedral', 'generic')
    expect(generic).toEqual(seedFor('cyclic', 'generic'))

    const corners = schwarzCorners('icosahedral')
    expect(seedFor('icosahedral', 'vertex')).toEqual(corners?.[0])
    expect(seedFor('icosahedral', 'edge')).toEqual(corners?.[1])
    expect(seedFor('icosahedral', 'face')).toEqual(corners?.[2])

    // Non-polyhedral: only the pole and the generic seed differ.
    expect(seedFor('cyclic', 'vertex')).toEqual(vec3(0, 0, 1))
    expect(seedFor('cyclic', 'edge')).toEqual(seedFor('cyclic', 'generic'))
  })

  it('satisfies |G| = |orbit| . |stabilizer|', () => {
    const ico = buildGroup('icosahedral')
    expect(stabilizerOrder(ico, seedFor('icosahedral', 'generic'))).toBe(1)
    expect(stabilizerOrder(ico, seedFor('icosahedral', 'vertex'))).toBe(5)
    expect(stabilizerOrder(ico, seedFor('icosahedral', 'edge'))).toBe(2)
    expect(stabilizerOrder(ico, seedFor('icosahedral', 'face'))).toBe(3)

    // The generic orbit is the whole group; an axis orbit is smaller.
    expect(orbit(ico, normalizeVec3(vec3(0.123, 0.456, 0.789)))).toHaveLength(60)
  })
})

describe('associated solid', () => {
  it('reports V/E/F obeying Euler for the Platonic groups', () => {
    const solids: [GroupId, number, number, number][] = [
      ['tetrahedral', 4, 6, 4],
      ['octahedral', 6, 12, 8],
      ['icosahedral', 12, 30, 20]
    ]
    for (const [id, v, e, f] of solids) {
      const vef = polyhedronVEF(id)
      expect(vef).toEqual({ v, e, f })
      expect(v - e + f).toBe(2)
    }
    expect(polyhedronVEF('cyclic')).toBeNull()
  })
})
