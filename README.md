<p align="center">
  <img src="assets/logo.svg" width="96" alt="diagrammatic-lab logo" />
</p>

<h1 align="center">diagrammatic-lab</h1>

A semantic workbench for **diagrammatic algebra** — diagrams as mathematical
objects, not just pictures. The project is a learning-and-contribution companion
to Chris Bowman's _Diagrammatic Algebra_ (Universitext), starting with
**Temperley–Lieb diagrams** and growing toward Coxeter groups, Bruhat order, and
Kazhdan–Lusztig theory.

It sits between diagram _editors_ (Quiver, TikZiT) and computer-algebra _systems_
(SageMath): a polished, learning-oriented **semantic visualizer** whose diagrams
carry algebraic meaning and can be validated, multiplied, and exported.

## What's here today

The MVP core — the `tl-playground` engine — is implemented and tested:

- **Validity**: is a set of arcs a genuine $\mathrm{TL}_n$ basis diagram? (a
  planar perfect matching: every point has degree one and no arcs cross.)
- **Basis**: enumerate every basis diagram of $\mathrm{TL}_n$ and check the count
  against the Catalan number $C_n = \frac{1}{n+1}\binom{2n}{n}$.
- **Multiplication**: stack $D_1$ over $D_2$, splice the shared row, and remove
  the closed loops, recording one factor of the loop parameter $\delta$ per loop.
- **Rendering**: export any diagram to **SVG** and **TikZ**.

Multiplication of diagrams is therefore

$$D_1 \cdot D_2 = \delta^{k}\, D_3,$$

where $k$ is the number of closed loops removed. The defining Temperley–Lieb
relations serve as correctness tests:

$$e_i e_i = \delta\, e_i, \qquad e_i\, e_{i\pm 1}\, e_i = e_i, \qquad e_i e_j = e_j e_i \quad (|i - j| \ge 2).$$

## Monorepo layout

```
diagrammatic-lab/
  packages/
    core/         # pure TypeScript algebra engine (no UI deps)
    renderer/     # SVG / TikZ rendering
    web/          # browser Temperley–Lieb explorer (Vite + React)
    examples/     # worked examples from the book
    infrastructure/  # AWS CDK: S3 + CloudFront hosting and GitHub OIDC
```

The central design rule: **the core algebra engine is independent of the UI.**

## Getting started

Requires Node ≥ 25 and Yarn 4 (via Corepack). With `nvm`, run `nvm use`.

```bash
corepack enable
yarn install

yarn build       # tsc -b across all packages
yarn typecheck   # type-check every package
yarn test        # run all package test suites (100% coverage gate)
yarn lint        # ESLint, zero warnings
yarn format      # Prettier check

# run the worked example
yarn workspace @diagrammatic-lab/examples build
yarn workspace @diagrammatic-lab/examples demo

# launch the browser playground (Vite dev server)
yarn workspace @diagrammatic-lab/web dev
```

## The Temperley–Lieb playground

`packages/web` is an interactive explorer: choose a rank $n$, drag two basis
diagrams of $\mathrm{TL}_n$ onto the slots, and see their product $\delta^k\, D$
rendered live, with SVG/TikZ export. The UI is a thin React layer over a pure,
unit-tested view-model (`web/src/model.ts`) that calls straight into `core` and
`renderer`.

## Roadmap

Aligned with the book (see `notebooks/notes/logs/`):

1. **Groups & Coxeter basics** — permutations, reduced words, length, Bruhat
   order for small $S_n$.
2. **Catalan & Temperley–Lieb** _(done)_ — diagrams, multiplication, loop
   removal, basis visualization, and an interactive browser playground.
3. **Kazhdan–Lusztig explorer** — Bruhat intervals and $P_{x,y}(q)$, with Sage as
   the oracle.
4. **Diagrammatic rewriting** — local relations turning a diagram into a
   normalized linear combination.
5. **Expository notes** — visual notes built from the engine's output.

## License

TBD.
