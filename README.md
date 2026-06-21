<p align="center">
  <img src="assets/logo.svg" width="96" alt="diagrammatic-lab logo" />
</p>

<h1 align="center">diagrammatic-lab</h1>

A semantic workbench for **diagrammatic algebra** - diagrams and algebraic
objects you can build, compute with, and visualize, not just draw. The project
is a learning companion to Chris Bowman's _Diagrammatic
Algebra_ (Universitext), spanning Temperley-Lieb diagrams, the finite symmetry
groups of the sphere, Coxeter combinatorics, and Kazhdan-Lusztig theory.

It sits between diagram _editors_ (Quiver, TikZiT) and computer-algebra _systems_
(SageMath): a polished, learning-oriented **semantic visualizer** whose objects
carry real mathematical meaning and are computed by a pure, fully tested engine.

## The playgrounds

Five interactive explorers, each a thin UI over a pure engine in `packages/core`:

- **Temperley-Lieb** - basis diagrams of $\mathrm{TL}_n(\delta)$; multiply two
  diagrams by stacking and removing closed loops, $D_1 \cdot D_2 = \delta^k D_3$,
  with live SVG / TikZ export.
- **Mobius & Finite Groups** - the finite subgroups of $\mathrm{PSL}_2(\mathbb{C})$
  (cyclic, dihedral, and the polyhedral $A_4, S_4, A_5$) as rotation groups of the
  Riemann sphere, drawn as a Schwarz-triangle kaleidoscope, with the
  orbit-stabiliser theorem and the rotation-axis census made visible.
- **Coxeter Groups** - the symmetric group $S_n$ as the Coxeter group of type
  $A_{n-1}$: length and inversions, reduced words, the **Bruhat order** as an
  interactive Hasse diagram, and reduced words drawn as wiring diagrams.
- **Kazhdan-Lusztig** - the polynomials $P_{x,y}(q)$ computed by the
  Bjorner-Brenti recursion, coloring each Bruhat interval by singularity - so the
  smallest singular Schubert varieties ($4231$ and $3412$, both with
  $P_{e,w} = 1 + q$) light up.
- **Diagram Rewriting** - the defining Temperley-Lieb relations as local rewrite
  moves (loop, contract, commute) reducing a word of generators to normal form,
  by hand or auto-reduce.

The Temperley-Lieb relations also serve as correctness tests throughout:

$$e_i e_i = \delta\, e_i, \qquad e_i\, e_{i\pm 1}\, e_i = e_i, \qquad e_i e_j = e_j e_i \quad (|i - j| \ge 2).$$

## Architecture

The central design rule: **the algebra engine is independent of the UI.**

Every playground is split into a pure, DOM-free, unit-tested **engine** in
`packages/core` and a thin **view** in `packages/web` (one folder per playground)
that renders it. The engine never imports React or the DOM; the web layer never
re-implements mathematics. Correctness is pinned by tests that check real
invariants - Catalan counts, group orders ($24 / 48 / 120$), axis censuses, the
$S_3$ Bruhat order, the published value $P_{e,4231} = 1 + q$, and that rewriting
preserves the underlying diagram.

Project conventions:

- **100% coverage gate** on all engine code (branches, lines, functions, statements).
- **No relative imports** - each package uses path aliases (`@core/*`, `@/*`, ...);
  built packages rewrite them at emit time with `tsc-alias`.

## Monorepo layout

```
diagrammatic-lab/
  packages/
    core/            # pure TS engines: Temperley-Lieb, Mobius / finite groups,
                     #   Coxeter, Kazhdan-Lusztig, diagram rewriting (no UI deps)
    renderer/        # SVG / TikZ rendering
    web/             # Vite + React hub; src/playgrounds/<name>/ per playground
    examples/        # runnable worked examples from the book
    infrastructure/  # AWS CDK: S3 + CloudFront hosting and GitHub OIDC
```

## Getting started

Requires Node >= 25 and Yarn 4 (via Corepack). With `nvm`, run `nvm use`.

```bash
corepack enable
yarn install

yarn build         # tsc -b across all packages (+ tsc-alias for built packages)
yarn typecheck     # type-check every package
yarn test          # all package test suites (100% coverage gate)
yarn lint          # ESLint, zero warnings
yarn format        # Prettier check
yarn check:ascii   # fail on any non-ASCII source character

# launch the browser hub (Vite dev server)
yarn workspace @diagrammatic-lab/web dev

# run a worked example
yarn workspace @diagrammatic-lab/examples build
yarn workspace @diagrammatic-lab/examples demo
```

## Roadmap

1. **Groups & Coxeter basics** _(done)_ - permutations, reduced words, length,
   Bruhat order for small $S_n$.
2. **Catalan & Temperley-Lieb** _(done)_ - diagrams, multiplication, loop removal,
   basis visualization, and an interactive playground.
3. **Kazhdan-Lusztig explorer** _(done)_ - Bruhat intervals and $P_{x,y}(q)$,
   computed directly by the engine and read as a singularity detector.
4. **Diagrammatic rewriting** _(done)_ - local relations reducing a diagram to a
   normal form.
5. **Expository notes** - visual notes built from the engine's output.

## License

Released under the [MIT License](LICENSE).
