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

- **Validity**: is a set of arcs a genuine `TL_n` basis diagram? (planar perfect
  matching: every point has degree one, no arcs cross.)
- **Basis**: enumerate all `C_n` basis diagrams of `TL_n` and check the count
  against the Catalan number.
- **Multiplication**: stack `D₁` over `D₂`, splice the shared row, remove closed
  loops, and record the power of the loop parameter `δ`:
  `D₁ · D₂ = δ^k · D₃`.
- **Rendering**: export any diagram to **SVG** and **TikZ**.

The defining Temperley–Lieb relations are used as correctness tests:
`eᵢ·eᵢ = δ·eᵢ`, `eᵢ·eᵢ₊₁·eᵢ = eᵢ`, and `eᵢ·eⱼ = eⱼ·eᵢ` for `|i−j| ≥ 2`.

## Monorepo layout

```
diagrammatic-lab/
  packages/
    core/         # pure TypeScript algebra engine (no UI deps)
    renderer/     # SVG / TikZ rendering
    web/          # browser Temperley–Lieb explorer (Vite + React)
    examples/     # worked examples from the book
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

`packages/web` is an interactive explorer: choose a rank `n`, click two basis
diagrams of `TL_n`, and see their product `δ^k · D` rendered live, with SVG/TikZ
export. The UI is a thin React layer over a pure, unit-tested view-model
(`web/src/model.ts`) that calls straight into `core` and `renderer`.

## Roadmap

Aligned with the book (see `notebooks/notes/logs/`):

1. **Groups & Coxeter basics** — permutations, reduced words, length, Bruhat
   order for small `Sₙ`.
2. **Catalan & Temperley–Lieb** _(done)_ — diagrams, multiplication, loop
   removal, basis visualization, and an interactive browser playground.
3. **Kazhdan–Lusztig explorer** — Bruhat intervals and `P_{x,y}(q)`, with Sage as
   the oracle.
4. **Diagrammatic rewriting** — local relations turning a diagram into a
   normalized linear combination.
5. **Expository notes** — visual notes built from the engine's output.

## License

TBD.
