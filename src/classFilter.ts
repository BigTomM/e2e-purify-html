/**
 * Check if a single class name looks like a generated hash
 * (styled-components, CSS Modules, emotion, etc.)
 */
export function isHashLikeClass(
  className: string,
  patterns: RegExp[],
): boolean {
  return patterns.some((pattern) => pattern.test(className));
}

/**
 * Filter a space-separated class string, removing hash-like classes.
 * Returns the cleaned class string, or `null` if all classes were removed.
 */
export function filterClasses(
  classValue: string,
  patterns: RegExp[],
): string | null {
  const classes = classValue.split(/\s+/).filter(Boolean);
  const kept = classes.filter((cls) => !isHashLikeClass(cls, patterns));
  return kept.length > 0 ? kept.join(' ') : null;
}
