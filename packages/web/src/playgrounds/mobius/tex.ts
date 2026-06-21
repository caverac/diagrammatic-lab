/** Mobius-specific LaTeX fragments, rendered by the shared `<Math>`. */

import { type GroupId, type MobiusClass } from './model'

/**
 * LaTeX for a finite rotation group. The cyclic and dihedral families take the
 * order parameter `n`; the polyhedral families are fixed.
 */
export function groupTex(id: GroupId, n: number): string {
  switch (id) {
    case 'cyclic':
      return `C_{${n}}`
    case 'dihedral':
      return `D_{${n}}`
    case 'tetrahedral':
      return 'A_4'
    case 'octahedral':
      return 'S_4'
    default:
      return 'A_5'
  }
}

/** A human-readable name for a finite rotation group. */
export function groupName(id: GroupId): string {
  switch (id) {
    case 'cyclic':
      return 'Cyclic'
    case 'dihedral':
      return 'Dihedral'
    case 'tetrahedral':
      return 'Tetrahedral'
    case 'octahedral':
      return 'Octahedral'
    default:
      return 'Icosahedral'
  }
}

/** The conjugacy class of a Mobius transformation, capitalized for display. */
export function classLabel(klass: MobiusClass): string {
  return klass.charAt(0).toUpperCase() + klass.slice(1)
}

/** LaTeX for a complex number, e.g. `1.50 - 0.25i`, rounded for display. */
export function complexTex(re: number, im: number): string {
  const r = re.toFixed(2)
  const sign = im < 0 ? '-' : '+'
  return `${r} ${sign} ${Math.abs(im).toFixed(2)}i`
}

/**
 * A one-line plain-English description of what the group is, abstractly. The
 * group symbol itself is rendered separately, so it is not repeated here.
 */
export function isomorphismName(id: GroupId): string {
  switch (id) {
    case 'cyclic':
      return 'rotations of a regular polygon'
    case 'dihedral':
      return 'rotations and flips of a regular polygon'
    case 'tetrahedral':
      return 'the even permutations of four things, Alt(4)'
    case 'octahedral':
      return 'all permutations of four things, Sym(4)'
    default:
      return 'the smallest non-abelian simple group, Alt(5)'
  }
}

/**
 * LaTeX for the group presentation. The polyhedral groups are the
 * orientation-preserving (von Dyck) triangle groups D(2,3,n).
 */
export function presentationTex(id: GroupId, n: number): string {
  switch (id) {
    case 'cyclic':
      return `\\langle a \\mid a^{${n}} = 1 \\rangle`
    case 'dihedral':
      return `\\langle a, b \\mid a^{${n}} = b^2 = (ab)^2 = 1 \\rangle`
    case 'tetrahedral':
      return '\\langle a, b, c \\mid a^2 = b^3 = c^3 = abc = 1 \\rangle'
    case 'octahedral':
      return '\\langle a, b, c \\mid a^2 = b^3 = c^4 = abc = 1 \\rangle'
    default:
      return '\\langle a, b, c \\mid a^2 = b^3 = c^5 = abc = 1 \\rangle'
  }
}

/** The Schwarz / triangle-group symbol `(p, q, r)` for the kaleidoscope. */
export function schwarzSymbol(id: GroupId, n: number): string {
  switch (id) {
    case 'cyclic':
      return `(${n})`
    case 'dihedral':
      return `(2, 2, ${n})`
    case 'tetrahedral':
      return '(2, 3, 3)'
    case 'octahedral':
      return '(2, 3, 4)'
    default:
      return '(2, 3, 5)'
  }
}

/** The Platonic solid (or solids) the group is the rotation symmetry of. */
export function solidName(id: GroupId): string {
  switch (id) {
    case 'cyclic':
      return 'Regular polygon (one axis)'
    case 'dihedral':
      return 'Regular polygon (with side axes)'
    case 'tetrahedral':
      return 'Tetrahedron (self-dual)'
    case 'octahedral':
      return 'Octahedron / Cube (dual pair)'
    default:
      return 'Icosahedron / Dodecahedron (dual pair)'
  }
}

/** An English name for an axis fold, e.g. 5 -> "five-fold". */
export function foldName(order: number): string {
  const names: Record<number, string> = {
    2: 'two-fold',
    3: 'three-fold',
    4: 'four-fold',
    5: 'five-fold'
  }
  return names[order] ?? `${order}-fold`
}
