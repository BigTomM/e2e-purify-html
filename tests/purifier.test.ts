import { describe, it, expect } from 'vitest';
import { purifyHtml, filterClasses, isHashLikeClass, DEFAULT_OPTIONS } from '../src';

describe('purifyHtml', () => {
  describe('element removal / emptying', () => {
    it('should empty SVG elements but keep the tag', () => {
      const html = '<div><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"/><circle cx="12" cy="12" r="10"/></svg></div>';
      const result = purifyHtml(html);
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
      expect(result).not.toContain('<path');
      expect(result).not.toContain('<circle');
    });

    it('should empty script tags', () => {
      const html = '<div><script>console.log("hello")</script><p>text</p></div>';
      const result = purifyHtml(html);
      expect(result).toContain('<script></script>');
      expect(result).not.toContain('console.log');
      expect(result).toContain('<p>text</p>');
    });

    it('should empty style tags', () => {
      const html = '<div><style>.foo { color: red; }</style><p>text</p></div>';
      const result = purifyHtml(html);
      expect(result).toContain('<style></style>');
      expect(result).not.toContain('color: red');
    });

    it('should remove noscript elements entirely', () => {
      const html = '<div><noscript>Enable JS</noscript><p>text</p></div>';
      const result = purifyHtml(html);
      expect(result).not.toContain('noscript');
      expect(result).not.toContain('Enable JS');
      expect(result).toContain('<p>text</p>');
    });
  });

  describe('attribute cleaning', () => {
    it('should remove inline styles', () => {
      const html = '<div style="color: red; font-size: 14px;">hello</div>';
      const result = purifyHtml(html);
      expect(result).not.toContain('style');
      expect(result).toContain('>hello</div>');
    });

    it('should remove event handlers', () => {
      const html = '<button onclick="alert(1)" onmouseover="hack()" type="submit">Click</button>';
      const result = purifyHtml(html);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('type="submit"');
      expect(result).toContain('>Click</button>');
    });

    it('should remove img src but keep alt', () => {
      const html = '<img src="data:image/png;base64,iVBORw0KGgoAAAANS..." alt="profile photo" title="User">';
      const result = purifyHtml(html);
      expect(result).not.toContain('src=');
      expect(result).toContain('alt="profile photo"');
      expect(result).toContain('title="User"');
    });

    it('should remove srcset', () => {
      const html = '<img srcset="small.jpg 480w, large.jpg 800w" alt="photo">';
      const result = purifyHtml(html);
      expect(result).not.toContain('srcset');
      expect(result).toContain('alt="photo"');
    });

    it('should keep data-testid but remove other data-* attributes', () => {
      const html = '<div data-testid="login-form" data-reactid="123" data-v-abc123="">content</div>';
      const result = purifyHtml(html);
      expect(result).toContain('data-testid="login-form"');
      expect(result).not.toContain('data-reactid');
      expect(result).not.toContain('data-v-abc123');
    });

    it('should keep data-test, data-cy, and data-test-id', () => {
      const html = '<button data-test="submit" data-cy="btn-submit" data-test-id="x" data-analytics="track">OK</button>';
      const result = purifyHtml(html);
      expect(result).toContain('data-test="submit"');
      expect(result).toContain('data-cy="btn-submit"');
      expect(result).toContain('data-test-id="x"');
      expect(result).not.toContain('data-analytics');
    });

    it('should keep semantic attributes: id, role, aria-*, type, name, placeholder', () => {
      const html = '<input id="email" role="textbox" aria-label="Email" type="email" name="email" placeholder="you@example.com" autocomplete="off">';
      const result = purifyHtml(html);
      expect(result).toContain('id="email"');
      expect(result).toContain('role="textbox"');
      expect(result).toContain('aria-label="Email"');
      expect(result).toContain('type="email"');
      expect(result).toContain('name="email"');
      expect(result).toContain('placeholder="you@example.com"');
    });

    it('should keep href on <a> tags', () => {
      const html = '<a href="/about" style="color:blue" class="sc-abc123 nav-link">About</a>';
      const result = purifyHtml(html);
      expect(result).toContain('href="/about"');
      expect(result).not.toContain('style=');
      expect(result).toContain('class="nav-link"');
    });

    it('should keep form attributes', () => {
      const html = '<form action="/submit" method="post" data-form-id="abc"><input name="email"></form>';
      const result = purifyHtml(html);
      expect(result).toContain('action="/submit"');
      expect(result).toContain('method="post"');
      expect(result).not.toContain('data-form-id');
    });

    it('should keep disabled, checked, required, selected, hidden, readonly', () => {
      const html = '<input disabled checked required readonly><option selected>opt</option><div hidden>secret</div>';
      const result = purifyHtml(html);
      expect(result).toContain('disabled');
      expect(result).toContain('checked');
      expect(result).toContain('required');
      expect(result).toContain('readonly');
      expect(result).toContain('selected');
      expect(result).toContain('hidden');
    });
  });

  describe('class attribute filtering', () => {
    it('should remove styled-components hash classes (sc-*)', () => {
      const html = '<div class="sc-bZQynM sc-gswNZr container active">content</div>';
      const result = purifyHtml(html);
      expect(result).toContain('class="container active"');
    });

    it('should remove emotion css-* classes', () => {
      const html = '<div class="css-1abc23 css-xyz789 btn primary">click</div>';
      const result = purifyHtml(html);
      expect(result).toContain('class="btn primary"');
    });

    it('should remove CSS Modules underscore-prefixed hashes', () => {
      const html = '<div class="_src_module__hash123 wrapper">content</div>';
      const result = purifyHtml(html);
      expect(result).toContain('class="wrapper"');
    });

    it('should remove pure hex hash classnames', () => {
      const html = '<div class="abc123def header">content</div>';
      const result = purifyHtml(html);
      expect(result).toContain('class="header"');
    });

    it('should remove class attribute entirely if all classes are hashes', () => {
      const html = '<div class="sc-bZQynM css-1abc23">content</div>';
      const result = purifyHtml(html);
      expect(result).not.toContain('class=');
      expect(result).toContain('<div>content</div>');
    });

    it('should keep normal semantic classes', () => {
      const html = '<div class="btn btn-primary active disabled">click</div>';
      const result = purifyHtml(html);
      expect(result).toContain('class="btn btn-primary active disabled"');
    });
  });

  describe('structure preservation', () => {
    it('should preserve element count and hierarchy', () => {
      const html = `
        <div id="app">
          <header>
            <nav>
              <a href="/">Home</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <section>
              <h1>Title</h1>
              <p>Paragraph</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </section>
          </main>
          <footer>Footer</footer>
        </div>
      `;
      const result = purifyHtml(html);

      // Count opening tags (rough check via regex)
      const originalTags = html.match(/<[a-z][a-z0-9]*[\s>]/gi) ?? [];
      const resultTags = result.match(/<[a-z][a-z0-9]*[\s>]/gi) ?? [];
      expect(resultTags.length).toBe(originalTags.length);
    });

    it('should preserve nested structure with noisy attributes removed', () => {
      const html = `
        <div class="sc-abc123" style="margin:0" data-reactid="1" id="root">
          <span class="css-xyz active" onclick="handle()" role="status">
            <img src="huge-base64-data" alt="icon" data-testid="status-icon">
          </span>
        </div>
      `;
      const result = purifyHtml(html);
      expect(result).toContain('id="root"');
      expect(result).toContain('role="status"');
      expect(result).toContain('class="active"');
      expect(result).toContain('alt="icon"');
      expect(result).toContain('data-testid="status-icon"');
      expect(result).not.toContain('style=');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('data-reactid');
      expect(result).not.toContain('src=');
    });

    it('should handle complex real-world HTML', () => {
      const html = `
        <div class="sc-gswNZr bKQZaL" style="display:flex;gap:8px" data-rbd-droppable-id="board">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
          <button class="sc-dmctIk fNRLOr" type="button" aria-label="Close" onclick="close()" style="background:none;border:none">
            <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaH..." alt="close icon">
          </button>
          <input type="text" class="sc-hMqMXs jJoJwg search-input" placeholder="Search..." name="q" data-testid="search-input" autocomplete="off" style="width:100%">
        </div>
      `;
      const result = purifyHtml(html);

      // SVG emptied
      expect(result).toContain('<svg></svg>');
      expect(result).not.toContain('<path');

      // Button: keep type and aria-label, remove events and styles
      expect(result).toContain('type="button"');
      expect(result).toContain('aria-label="Close"');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('style=');

      // Img: src removed, alt kept
      expect(result).toContain('alt="close icon"');
      expect(result).not.toContain('src=');

      // Input: semantic attrs kept
      expect(result).toContain('type="text"');
      expect(result).toContain('placeholder="Search..."');
      expect(result).toContain('name="q"');
      expect(result).toContain('data-testid="search-input"');
      expect(result).toContain('class="search-input"');
      expect(result).not.toContain('autocomplete');
    });
  });

  describe('custom options', () => {
    it('should allow removeAllClasses option', () => {
      const html = '<div class="btn primary sc-abc123">content</div>';
      const result = purifyHtml(html, { removeAllClasses: true });
      expect(result).not.toContain('class=');
    });

    it('should allow custom emptyElements', () => {
      const html = '<div><canvas>fallback</canvas><iframe>content</iframe></div>';
      const result = purifyHtml(html, { emptyElements: ['svg', 'script', 'style', 'canvas', 'iframe'] });
      expect(result).toContain('<canvas></canvas>');
      expect(result).toContain('<iframe></iframe>');
    });

    it('should allow custom removeElements', () => {
      const html = '<div><aside>sidebar</aside><main>content</main></div>';
      const result = purifyHtml(html, { removeElements: ['noscript', 'aside'] });
      expect(result).not.toContain('aside');
      expect(result).toContain('<main>content</main>');
    });

    it('should allow keeping img src when removeImgSrc is false', () => {
      const html = '<img src="/photo.jpg" alt="photo">';
      const result = purifyHtml(html, { removeImgSrc: false });
      expect(result).toContain('src="/photo.jpg"');
      expect(result).toContain('alt="photo"');
    });

    it('should allow custom keepDataAttributes', () => {
      const html = '<div data-testid="x" data-custom="y" data-track="z">content</div>';
      const result = purifyHtml(html, {
        keepDataAttributes: ['data-testid', 'data-test', 'data-cy', 'data-test-id', 'data-custom'],
      });
      expect(result).toContain('data-testid="x"');
      expect(result).toContain('data-custom="y"');
      expect(result).not.toContain('data-track');
    });

    it('should support transformAttribute for custom logic', () => {
      const html = '<a href="https://example.com/page?token=secret&ref=abc">link</a>';
      const result = purifyHtml(html, {
        transformAttribute: (el, attr, value) => {
          if (el === 'a' && attr === 'href') {
            try {
              const url = new URL(value);
              return url.origin + url.pathname;
            } catch {
              return value;
            }
          }
          return value;
        },
      });
      expect(result).toContain('href="https://example.com/page"');
      expect(result).not.toContain('token=secret');
    });
  });
});

describe('filterClasses', () => {
  it('should remove hash classes and keep semantic ones', () => {
    const result = filterClasses(
      'sc-abc123 btn active css-xyz789',
      DEFAULT_OPTIONS.hashClassPatterns,
    );
    expect(result).toBe('btn active');
  });

  it('should return null if all classes are hashes', () => {
    const result = filterClasses(
      'sc-abc123 css-xyz789',
      DEFAULT_OPTIONS.hashClassPatterns,
    );
    expect(result).toBeNull();
  });

  it('should keep all classes when none match hash patterns', () => {
    const result = filterClasses(
      'btn btn-lg primary',
      DEFAULT_OPTIONS.hashClassPatterns,
    );
    expect(result).toBe('btn btn-lg primary');
  });
});

describe('isHashLikeClass', () => {
  const patterns = DEFAULT_OPTIONS.hashClassPatterns;

  it.each([
    'sc-bZQynM',
    'sc-1234abc',
    'css-1abc23',
    'css-xyz789',
    'styled-abc123',
    '_src_module__hash123',
    'abc123def456',
    'tw-abcd1234',
  ])('should detect "%s" as hash-like', (cls) => {
    expect(isHashLikeClass(cls, patterns)).toBe(true);
  });

  it.each([
    'btn',
    'active',
    'hidden',
    'btn-primary',
    'container',
    'flex',
    'mt-4',
    'text-lg',
    'w-full',
    'header',
  ])('should NOT detect "%s" as hash-like', (cls) => {
    expect(isHashLikeClass(cls, patterns)).toBe(false);
  });
});
