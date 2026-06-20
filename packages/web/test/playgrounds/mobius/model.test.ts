import {
  applyMobius,
  buildGroup,
  cAbs,
  cAdd,
  cDiv,
  cMul,
  cSub,
  classifyMobius,
  complex,
  composeMobius,
  detMobius,
  isIdentityRotation,
  mobius,
  normalizeVec3,
  orbit,
  PHI,
  planeToSphere,
  polytopeEdges,
  projectSphere,
  quat,
  quatConj,
  quatMul,
  quatToMobius,
  representativeRotation,
  rotateVec3,
  rotationQuat,
  sphereToPlane,
  traceMobius,
  vec3,
  type Complex
} from '../../../src/playgrounds/mobius/model'

const c = complex
const I = quat(1, 0, 0, 0)

function expectComplex(z: Complex, re: number, im: number): void {
  expect(z.re).toBeCloseTo(re, 9)
  expect(z.im).toBeCloseTo(im, 9)
}

describe('complex arithmetic', () => {
  it('adds, subtracts, and multiplies', () => {
    expectComplex(cAdd(c(1, 2), c(3, -1)), 4, 1)
    expectComplex(cSub(c(1, 2), c(3, -1)), -2, 3)
    expectComplex(cMul(c(1, 2), c(3, 4)), -5, 10)
  })

  it('takes modulus and divides', () => {
    expect(cAbs(c(3, 4))).toBeCloseTo(5)
    expectComplex(cDiv(c(1, 0), c(0, 1)), 0, -1)
  })
})

describe('Mobius matrices', () => {
  it('computes determinant and trace', () => {
    const m = mobius(c(2, 0), c(1, 0), c(0, 0), c(3, 0))
    expectComplex(detMobius(m), 6, 0)
    expectComplex(traceMobius(m), 5, 0)
  })

  it('composes as matrix multiplication', () => {
    const m = mobius(c(1, 0), c(1, 0), c(0, 0), c(1, 0))
    const square = composeMobius(m, m)
    expectComplex(square.b, 2, 0)
  })

  it('applies to finite points and the pole/infinity', () => {
    const id = mobius(c(1, 0), c(0, 0), c(0, 0), c(1, 0))
    expectComplex(applyMobius(id, c(2, 3)) as Complex, 2, 3)

    // infinity |-> a/c when c != 0, and infinity |-> infinity when c = 0.
    expectComplex(applyMobius(mobius(c(2, 0), c(0, 0), c(1, 0), c(0, 0)), null) as Complex, 2, 0)
    expect(applyMobius(id, null)).toBeNull()

    // The pole -d/c |-> infinity.
    expect(applyMobius(mobius(c(1, 0), c(0, 0), c(1, 0), c(0, 0)), c(0, 0))).toBeNull()
  })
})

describe('classifyMobius', () => {
  it('rejects a degenerate matrix', () => {
    expect(() => classifyMobius(mobius(c(1, 0), c(1, 0), c(1, 0), c(1, 0)))).toThrow(RangeError)
  })

  it('recognizes the identity', () => {
    expect(classifyMobius(mobius(c(1, 0), c(0, 0), c(0, 0), c(1, 0)))).toBe('identity')
  })

  it('separates elliptic, parabolic, hyperbolic, and loxodromic', () => {
    expect(classifyMobius(mobius(c(0, 1), c(0, 0), c(0, 0), c(0, -1)))).toBe('elliptic')
    expect(classifyMobius(mobius(c(1, 0), c(1, 0), c(0, 0), c(1, 0)))).toBe('parabolic')
    expect(classifyMobius(mobius(c(2, 0), c(0, 0), c(0, 0), c(0.5, 0)))).toBe('hyperbolic')
    // Complex trace ratio -> loxodromic.
    expect(classifyMobius(mobius(c(1, 1), c(0, 0), c(0, 0), c(0.5, -0.5)))).toBe('loxodromic')
    // Real but negative trace ratio -> also loxodromic.
    expect(classifyMobius(mobius(c(0, 1), c(0, 0), c(0, 0), c(0, -2)))).toBe('loxodromic')
  })
})

describe('vectors and quaternions', () => {
  it('normalizes a vector', () => {
    const u = normalizeVec3(vec3(0, 3, 4))
    expect(Math.hypot(u.x, u.y, u.z)).toBeCloseTo(1)
  })

  it('multiplies and conjugates quaternions', () => {
    expect(quatMul(I, I)).toEqual(I)
    expect(quatConj(quat(1, 2, 3, 4))).toEqual(quat(1, -2, -3, -4))
  })

  it('rotates a vector about the z-axis', () => {
    const r = rotateVec3(rotationQuat(vec3(0, 0, 1), Math.PI / 2), vec3(1, 0, 0))
    expect(r.x).toBeCloseTo(0)
    expect(r.y).toBeCloseTo(1)
    expect(r.z).toBeCloseTo(0)
  })

  it('maps a unit quaternion to a determinant-one Mobius matrix', () => {
    const m = quatToMobius(quat(0, 1, 0, 0))
    expectComplex(detMobius(m), 1, 0)
    expect(classifyMobius(m)).toBe('elliptic')
  })
})

describe('stereographic projection', () => {
  it('sends the north pole to infinity and back', () => {
    expect(sphereToPlane(vec3(0, 0, 1))).toBeNull()
    expect(planeToSphere(null)).toEqual(vec3(0, 0, 1))
  })

  it('projects a finite point and inverts it', () => {
    expectComplex(sphereToPlane(vec3(1, 0, 0)) as Complex, 1, 0)
    const back = planeToSphere(c(1, 0))
    expect(back.x).toBeCloseTo(1)
    expect(back.z).toBeCloseTo(0)
  })
})

describe('finite rotation groups', () => {
  it('builds each family with the right order', () => {
    expect(buildGroup('cyclic', 5).order).toBe(5)
    expect(buildGroup('dihedral', 5).order).toBe(10)
    expect(buildGroup('tetrahedral').order).toBe(12)
    expect(buildGroup('octahedral').order).toBe(24)
    expect(buildGroup('icosahedral').order).toBe(60)
  })

  it('uses the golden ratio for the icosahedral group', () => {
    expect(PHI).toBeCloseTo(1.618033988)
  })

  it('produces recognizable polytope orbits', () => {
    const cyclic = buildGroup('cyclic', 5)
    const pentagon = orbit(cyclic, cyclic.seed)
    expect(pentagon).toHaveLength(5)
    expect(polytopeEdges(pentagon)).toHaveLength(5)

    const octa = buildGroup('octahedral')
    const octahedron = orbit(octa, octa.seed)
    expect(octahedron).toHaveLength(6)
    expect(polytopeEdges(octahedron)).toHaveLength(12)

    const tetra = buildGroup('tetrahedral')
    expect(polytopeEdges(orbit(tetra, tetra.seed))).toHaveLength(6)

    const ico = buildGroup('icosahedral')
    const icosahedron = orbit(ico, ico.seed)
    expect(icosahedron).toHaveLength(12)
    expect(polytopeEdges(icosahedron)).toHaveLength(30)

    const dihedral = buildGroup('dihedral', 5)
    const antiprism = orbit(dihedral, dihedral.seed)
    expect(antiprism).toHaveLength(10)
    expect(polytopeEdges(antiprism).length).toBeGreaterThan(0)
  })

  it('picks a non-identity generator, falling back for the trivial group', () => {
    expect(isIdentityRotation(quat(1, 0, 0, 0))).toBe(true)
    expect(isIdentityRotation(quat(0, 1, 0, 0))).toBe(false)
    expect(isIdentityRotation(representativeRotation(buildGroup('icosahedral')))).toBe(false)
    // C_1 is trivial: the only element is the identity, so we fall back to it.
    expect(isIdentityRotation(representativeRotation(buildGroup('cyclic', 1)))).toBe(true)
  })

  it('projects an orbit to depth-tagged plane points', () => {
    const ico = buildGroup('icosahedral')
    const projected = projectSphere(orbit(ico, ico.seed), I)
    expect(projected).toHaveLength(12)
    for (const p of projected) {
      expect(Math.abs(p.depth)).toBeLessThanOrEqual(1 + 1e-9)
    }
  })
})
