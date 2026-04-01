import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { PurifyHtmlOptions } from './types';
import { DEFAULT_OPTIONS } from './defaults';
import { filterClasses } from './classFilter';

/**
 * Merge user options with defaults.
 * Arrays and patterns are replaced (not merged) when provided by the user.
 */
function mergeOptions(
  userOptions?: Partial<PurifyHtmlOptions>,
): PurifyHtmlOptions {
  if (!userOptions) return { ...DEFAULT_OPTIONS };
  return { ...DEFAULT_OPTIONS, ...userOptions };
}

/**
 * Check if an attribute name matches any pattern in a list.
 * Patterns can be exact names or prefix wildcards like `'on*'`, `'aria-*'`.
 */
function matchesPattern(attrName: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (attrName.startsWith(prefix)) return true;
    } else {
      if (attrName === pattern) return true;
    }
  }
  return false;
}

/**
 * Determine whether an attribute should be kept.
 * Uses a whitelist approach: only explicitly kept attributes survive.
 */
function shouldKeepAttribute(
  tagName: string,
  attrName: string,
  options: PurifyHtmlOptions,
): boolean {
  // class is handled separately
  if (attrName === 'class') return true;

  // Explicit blacklist always removes (event handlers, style, etc.)
  if (matchesPattern(attrName, options.removeAttributes)) {
    return false;
  }

  // <img src> removal
  if (options.removeImgSrc && tagName === 'img' && attrName === 'src') {
    return false;
  }

  // <img srcset> / <source srcset> removal
  if (options.removeImgSrcset && attrName === 'srcset') {
    return false;
  }

  // data-* attributes: keep only whitelisted ones
  if (attrName.startsWith('data-')) {
    return options.keepDataAttributes.includes(attrName);
  }

  // Whitelist: only keep if in keepAttributes
  return matchesPattern(attrName, options.keepAttributes);
}

/**
 * Purify an HTML string by stripping noise while preserving structure.
 *
 * @param html - The raw HTML string to purify
 * @param options - Optional overrides for the default purification rules
 * @returns The purified HTML string
 */
export function purifyHtml(
  html: string,
  options?: Partial<PurifyHtmlOptions>,
): string {
  const opts = mergeOptions(options);
  const $ = cheerio.load(html);

  // Step 1: Remove elements entirely (tag + children)
  for (const selector of opts.removeElements) {
    $(selector).remove();
  }

  // Step 2: Empty elements (keep tag, remove all children)
  for (const selector of opts.emptyElements) {
    $(selector).empty();
  }

  // Step 3: Clean attributes on every element
  $('*').each(function () {
    const el = $(this);
    const tagName = (this as unknown as Element).tagName?.toLowerCase() ?? '';
    const attribs = (this as unknown as Element).attribs;
    if (!attribs) return;

    const attrsToRemove: string[] = [];

    for (const attrName of Object.keys(attribs)) {
      // Run custom transform if provided
      if (opts.transformAttribute) {
        const result = opts.transformAttribute(tagName, attrName, attribs[attrName]);
        if (result === undefined) {
          attrsToRemove.push(attrName);
          continue;
        }
        el.attr(attrName, result);
        continue;
      }

      if (!shouldKeepAttribute(tagName, attrName, opts)) {
        attrsToRemove.push(attrName);
      }
    }

    for (const attr of attrsToRemove) {
      el.removeAttr(attr);
    }

    // Handle class attribute
    if (attribs['class'] !== undefined) {
      if (opts.removeAllClasses) {
        el.removeAttr('class');
      } else {
        const filtered = filterClasses(attribs['class'], opts.hashClassPatterns);
        if (filtered === null) {
          el.removeAttr('class');
        } else {
          el.attr('class', filtered);
        }
      }
    }
  });

  // Determine the output scope — return only the body content if cheerio
  // wrapped the input in <html><head><body>
  // cheerio.load always wraps in html/head/body; extract body innerHTML
  const body = $('body');
  return body.html() ?? '';
}
