# @diagrammatic-lab/sage-bridge

A [SageMath](https://www.sagemath.org/) correctness oracle for the core engine.

This package is **not** part of the TypeScript build. It exists so that the
results computed by `@diagrammatic-lab/core` can be cross-checked, for small
cases, against an independent reference — first a dependency-free Python
implementation, and then SageMath's own `TemperleyLiebAlgebra` when it is
available.

## Usage

```bash
# Dependency-free reference table (no Sage required)
python3 oracle.py
```

This prints, for each rank `n`, the Catalan number `C_n` and an independent
count of non-crossing perfect matchings of `2n` points. Both must equal the
length of `enumerateBasis(n)` in `@diagrammatic-lab/core`.

## With SageMath

If Sage is installed, `sage_temperley_lieb_dimension(n)` returns
`dim TL_n` straight from Sage's `TemperleyLiebAlgebra`, giving an authoritative
oracle for the dimension. Later phases (Kazhdan–Lusztig polynomials, Bruhat
order) will lean on Sage more heavily — see the roadmap in the root `README.md`.
