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
} from '../../../src/playgrounds/mobius/tex'

describe('groupTex', () => {
  it('renders each family, parameterized where relevant', () => {
    expect(groupTex('cyclic', 6)).toBe('C_{6}')
    expect(groupTex('dihedral', 4)).toBe('D_{4}')
    expect(groupTex('tetrahedral', 5)).toBe('A_4')
    expect(groupTex('octahedral', 5)).toBe('S_4')
    expect(groupTex('icosahedral', 5)).toBe('A_5')
  })
})

describe('groupName', () => {
  it('names every family', () => {
    expect(groupName('cyclic')).toBe('Cyclic')
    expect(groupName('dihedral')).toBe('Dihedral')
    expect(groupName('tetrahedral')).toBe('Tetrahedral')
    expect(groupName('octahedral')).toBe('Octahedral')
    expect(groupName('icosahedral')).toBe('Icosahedral')
  })
})

describe('classLabel', () => {
  it('capitalizes a conjugacy class', () => {
    expect(classLabel('elliptic')).toBe('Elliptic')
    expect(classLabel('loxodromic')).toBe('Loxodromic')
  })
})

describe('complexTex', () => {
  it('formats both signs of the imaginary part', () => {
    expect(complexTex(1.5, 0.5)).toBe('1.50 + 0.50i')
    expect(complexTex(1.5, -0.5)).toBe('1.50 - 0.50i')
  })
})

describe('group facts', () => {
  it('names the abstract isomorphism for every family', () => {
    expect(isomorphismName('cyclic')).toContain('polygon')
    expect(isomorphismName('dihedral')).toContain('flips')
    expect(isomorphismName('tetrahedral')).toContain('Alt(4)')
    expect(isomorphismName('octahedral')).toContain('Sym(4)')
    expect(isomorphismName('icosahedral')).toContain('Alt(5)')
  })

  it('gives the von Dyck presentation for every family', () => {
    expect(presentationTex('cyclic', 6)).toBe('\\langle a \\mid a^{6} = 1 \\rangle')
    expect(presentationTex('dihedral', 4)).toContain('a^{4} = b^2')
    expect(presentationTex('tetrahedral', 5)).toContain('c^3')
    expect(presentationTex('octahedral', 5)).toContain('c^4')
    expect(presentationTex('icosahedral', 5)).toContain('c^5')
  })

  it('gives the Schwarz triangle symbol for every family', () => {
    expect(schwarzSymbol('cyclic', 7)).toBe('(7)')
    expect(schwarzSymbol('dihedral', 7)).toBe('(2, 2, 7)')
    expect(schwarzSymbol('tetrahedral', 5)).toBe('(2, 3, 3)')
    expect(schwarzSymbol('octahedral', 5)).toBe('(2, 3, 4)')
    expect(schwarzSymbol('icosahedral', 5)).toBe('(2, 3, 5)')
  })

  it('names the associated solid for every family', () => {
    expect(solidName('cyclic')).toContain('polygon')
    expect(solidName('dihedral')).toContain('polygon')
    expect(solidName('tetrahedral')).toContain('Tetrahedron')
    expect(solidName('octahedral')).toContain('Octahedron')
    expect(solidName('icosahedral')).toContain('Icosahedron')
  })

  it('names axis folds, with a fallback for large folds', () => {
    expect(foldName(2)).toBe('two-fold')
    expect(foldName(3)).toBe('three-fold')
    expect(foldName(4)).toBe('four-fold')
    expect(foldName(5)).toBe('five-fold')
    expect(foldName(6)).toBe('6-fold')
  })
})
