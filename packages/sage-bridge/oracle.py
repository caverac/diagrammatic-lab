"""SageMath correctness oracle for the Temperley-Lieb core engine.

The TypeScript engine in ``packages/core`` is the implementation under test;
this module provides an *independent* reference for small cases so the two can
be cross-checked.

Two levels are offered:

* A dependency-free reference (:func:`catalan`,
  :func:`count_noncrossing_matchings`) that always runs.
* An optional bridge to SageMath's :class:`TemperleyLiebAlgebra`
  (:func:`sage_temperley_lieb_dimension`), used as the authoritative oracle when
  Sage is available.

Run ``python3 oracle.py`` to print the basis-size table the core test suite
checks against.
"""

from __future__ import annotations

from typing import List


def catalan(n: int) -> int:
    """Return the ``n``-th Catalan number via the standard recurrence.

    Args:
        n: A non-negative integer.

    Returns:
        ``C_n = (1 / (n + 1)) * binomial(2n, n)``.

    Raises:
        ValueError: If ``n`` is negative.
    """
    if n < 0:
        raise ValueError(f"catalan expects a non-negative integer, got {n}")
    table: List[int] = [1]
    for k in range(1, n + 1):
        table.append(sum(table[i] * table[k - 1 - i] for i in range(k)))
    return table[n]


def count_noncrossing_matchings(points: int) -> int:
    """Count non-crossing perfect matchings of ``points`` points on a line.

    This is the dimension of ``TL_n`` for ``points = 2 * n``; it equals
    :func:`catalan` of ``n`` and is computed here by an independent recursion
    so the two formulas validate each other.

    Args:
        points: An even, non-negative number of boundary points.

    Returns:
        The number of non-crossing perfect matchings.

    Raises:
        ValueError: If ``points`` is negative or odd.
    """
    if points < 0 or points % 2 != 0:
        raise ValueError(f"expected a non-negative even count, got {points}")
    if points == 0:
        return 1
    total = 0
    for partner in range(1, points, 2):
        inside = partner - 1
        outside = points - partner - 1
        total += count_noncrossing_matchings(inside) * count_noncrossing_matchings(outside)
    return total


def sage_temperley_lieb_dimension(rank: int, delta: int = 2) -> int:
    """Return ``dim TL_rank`` as reported by SageMath, if Sage is installed.

    Args:
        rank: The rank ``n`` of the Temperley-Lieb algebra.
        delta: The loop parameter (any nonzero value gives the same dimension).

    Returns:
        The number of diagram-basis elements of ``TL_rank``.

    Raises:
        ImportError: If SageMath is not importable in the current interpreter.
    """
    try:
        from sage.all import TemperleyLiebAlgebra, QQ
    except ImportError as exc:  # pragma: no cover - depends on optional Sage
        raise ImportError("SageMath is required for sage_temperley_lieb_dimension") from exc
    algebra = TemperleyLiebAlgebra(rank, QQ(delta), QQ)  # pragma: no cover
    return len(list(algebra.basis()))  # pragma: no cover


def main() -> None:
    """Print the basis-size table the core test suite checks against."""
    print("n\tcatalan(n)\tnoncrossing(2n)")
    for n in range(0, 7):
        print(f"{n}\t{catalan(n)}\t\t{count_noncrossing_matchings(2 * n)}")


if __name__ == "__main__":
    main()
