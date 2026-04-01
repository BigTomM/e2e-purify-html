export interface PurifyHtmlOptions {
  /**
   * Elements to empty (keep the tag, remove all children).
   * e.g. `['svg', 'script', 'style']` → `<svg></svg>`
   */
  emptyElements: string[];

  /**
   * Elements to remove entirely (tag + children).
   * e.g. `['noscript']`
   */
  removeElements: string[];

  /**
   * Attribute names to always remove.
   * Supports exact names and prefix patterns ending with `*` (e.g. `'on*'`).
   */
  removeAttributes: string[];

  /**
   * Attribute names to always keep (takes priority over removeAttributes).
   * Supports exact names and prefix patterns ending with `*` (e.g. `'aria-*'`).
   */
  keepAttributes: string[];

  /**
   * Regex patterns to detect hash-like / generated classnames to remove.
   */
  hashClassPatterns: RegExp[];

  /**
   * If true, remove the entire `class` attribute instead of filtering individual classes.
   * @default false
   */
  removeAllClasses: boolean;

  /**
   * `data-*` attribute names to keep (e.g. `['data-testid', 'data-test', 'data-cy']`).
   * All other `data-*` attributes will be removed.
   */
  keepDataAttributes: string[];

  /**
   * Remove `src` attribute from `<img>` elements.
   * @default true
   */
  removeImgSrc: boolean;

  /**
   * Remove `srcset` attribute from elements.
   * @default true
   */
  removeImgSrcset: boolean;

  /**
   * Custom handler to transform an attribute value.
   * Return `undefined` to remove the attribute, or a string to replace its value.
   */
  transformAttribute?: (
    element: string,
    attr: string,
    value: string,
  ) => string | undefined;
}
