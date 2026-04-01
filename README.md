# purify-html

Simplify HTML for e2e testing — strips noise (SVG internals, `<img>` src, random classnames, inline styles, event handlers) while preserving element count, hierarchy, and semantic attributes.

## Install

```bash
npm install purify-html
```

## Usage

```ts
import { purifyHtml } from 'purify-html';

const dirty = `
  <div class="sc-bZQynM container" style="margin:0" onclick="track()" data-reactid="1">
    <svg viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"/>
    </svg>
    <img src="data:image/png;base64,iVBORw0KGgo..." alt="avatar">
    <button type="submit" class="css-1abc23 btn" data-testid="submit-btn">Submit</button>
  </div>
`;

const clean = purifyHtml(dirty);
console.log(clean);
```

**Output:**

```html
<div class="container">
  <svg></svg>
  <img alt="avatar">
  <button type="submit" class="btn" data-testid="submit-btn">Submit</button>
</div>
```

## What It Does

| Rule | Default Behavior |
|------|------------------|
| **Empty elements** | `<svg>`, `<script>`, `<style>` → keep tag, remove children |
| **Remove elements** | `<noscript>` → removed entirely |
| **Remove attributes** | `style`, `on*` (event handlers), `srcset`, `nonce`, `integrity` |
| **Remove `<img>` src** | Strips `src` from `<img>` (keeps `alt`, `title`) |
| **data-\* attributes** | Keep only `data-testid`, `data-test`, `data-cy`, `data-test-id` |
| **Class filtering** | Remove hash-like classes (`sc-*`, `css-*`, hex hashes, CSS Modules) |
| **Always keep** | `id`, `role`, `aria-*`, `type`, `name`, `placeholder`, `value`, `disabled`, `checked`, `href`, `alt`, `title`, `for`, `action`, `method`, etc. |

## Options

```ts
import { purifyHtml, PurifyHtmlOptions } from 'purify-html';

const result = purifyHtml(html, {
  // Elements to empty (keep tag, remove children)
  emptyElements: ['svg', 'script', 'style'],

  // Elements to remove entirely
  removeElements: ['noscript'],

  // Attributes to remove (supports prefix wildcards like 'on*')
  removeAttributes: ['style', 'on*', 'srcset', 'nonce'],

  // Attributes to always keep (overrides removeAttributes)
  keepAttributes: ['id', 'role', 'aria-*', 'type', 'name', 'href', 'alt'],

  // Regex patterns for hash-like classnames to remove
  hashClassPatterns: [/^sc-/, /^css-/, /^[a-f0-9]{6,}$/],

  // Remove ALL classes instead of just hash-like ones
  removeAllClasses: false,

  // data-* attributes to keep
  keepDataAttributes: ['data-testid', 'data-test', 'data-cy', 'data-test-id'],

  // Remove src from <img>
  removeImgSrc: true,

  // Remove srcset attribute
  removeImgSrcset: true,

  // Custom attribute transformer
  transformAttribute: (element, attr, value) => {
    // Return undefined to remove, or string to replace value
    if (element === 'a' && attr === 'href') {
      const url = new URL(value);
      return url.origin + url.pathname; // strip query params
    }
    return value;
  },
});
```

## API

### `purifyHtml(html: string, options?: Partial<PurifyHtmlOptions>): string`

Purifies the given HTML string and returns the cleaned HTML.

### `filterClasses(classValue: string, patterns: RegExp[]): string | null`

Filter a space-separated class string, removing classes matching the patterns. Returns `null` if all classes were removed.

### `isHashLikeClass(className: string, patterns: RegExp[]): boolean`

Check if a single class name matches any hash-like pattern.

### `DEFAULT_OPTIONS`

The built-in default options object. Useful as a base for customization.

## License

MIT
