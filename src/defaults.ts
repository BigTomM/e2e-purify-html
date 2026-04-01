import type { PurifyHtmlOptions } from './types';

export const DEFAULT_OPTIONS: PurifyHtmlOptions = {
  emptyElements: ['svg', 'script', 'style'],

  removeElements: ['noscript'],

  removeAttributes: [
    'style',
    'on*',    // all event handlers: onclick, onerror, onload, etc.
    'srcset',
    'nonce',
    'integrity',
    'crossorigin',
  ],

  keepAttributes: [
    // identity & accessibility
    'id',
    'role',
    'aria-*',
    // form semantics
    'type',
    'name',
    'placeholder',
    'value',
    'for',
    'action',
    'method',
    'enctype',
    // states
    'disabled',
    'checked',
    'readonly',
    'required',
    'hidden',
    'selected',
    'open',
    // links
    'href',
    'src',
    // media semantics
    'alt',
    'title',
    'target',
    'rel',
    // layout hints (useful for e2e)
    'colspan',
    'rowspan',
    'scope',
    'headers',
    // testing attributes (handled separately via keepDataAttributes too)
    'data-testid',
    'data-test',
    'data-cy',
    'data-test-id',
  ],

  hashClassPatterns: [
    // styled-components: sc-aBcDeF, sc-1234abc
    /^sc-[a-zA-Z0-9_-]+$/,
    // emotion / css-in-js: css-1abc23, css-aBcDeF
    /^css-[a-zA-Z0-9_-]+$/,
    // styled-jsx, linaria, etc.
    /^styled-[a-zA-Z0-9_-]+$/,
    // CSS Modules: _src_module__hash, Component_xyz_1a2b
    /^_[a-zA-Z0-9_-]{5,}$/,
    // Generic hash-only classnames (6+ hex chars)
    /^[a-f0-9]{6,}$/,
    // Common bundler-generated patterns: a1B2cD (short prefix + mixed case hash)
    /^[a-z]{1,3}[A-Z][a-zA-Z0-9]{4,}$/,
    // Tailwind JIT hash (tw-xxxxx)
    /^tw-[a-zA-Z0-9]{4,}$/,
  ],

  removeAllClasses: false,

  keepDataAttributes: [
    'data-testid',
    'data-test',
    'data-cy',
    'data-test-id',
  ],

  removeImgSrc: true,

  removeImgSrcset: true,
};
