const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Verdadeiro quando a pessoa pediu ao sistema para reduzir animações. */
export function prefersReducedMotion() {
  return query.matches;
}
