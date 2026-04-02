import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { purifyHtmlFile } from '../src';

describe('purifyHtmlFile', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'purifyhtml-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should purify an HTML file and write default output', async () => {
    const inputPath = join(tempDir, 'page.html');
    const inputHtml = `<html><body>
      <div style="color:red" onclick="alert(1)" id="root">
        <svg viewBox="0 0 24 24"><path d="M12 2"/></svg>
        <img src="data:image/png;base64,abc" alt="photo">
        <p class="sc-abc123 content">Hello</p>
      </div>
    </body></html>`;
    await writeFile(inputPath, inputHtml, 'utf-8');

    const outputPath = await purifyHtmlFile(inputPath);

    expect(outputPath).toBe(join(tempDir, 'page.purified.html'));
    const output = await readFile(outputPath, 'utf-8');
    expect(output).toContain('id="root"');
    expect(output).not.toContain('style=');
    expect(output).not.toContain('onclick');
    expect(output).toContain('<svg></svg>');
    expect(output).not.toContain('src=');
    expect(output).toContain('alt="photo"');
    expect(output).toContain('class="content"');
    expect(output).toContain('>Hello</p>');
  });

  it('should write to a custom output path', async () => {
    const inputPath = join(tempDir, 'input.html');
    const outputPath = join(tempDir, 'clean.html');
    await writeFile(inputPath, '<div style="margin:0" id="x">text</div>', 'utf-8');

    const result = await purifyHtmlFile(inputPath, { output: outputPath });

    expect(result).toBe(outputPath);
    const output = await readFile(outputPath, 'utf-8');
    expect(output).toContain('id="x"');
    expect(output).not.toContain('style=');
    expect(output).toContain('>text</div>');
  });

  it('should pass purification options through', async () => {
    const inputPath = join(tempDir, 'test.html');
    await writeFile(inputPath, '<div class="btn primary">ok</div>', 'utf-8');

    await purifyHtmlFile(inputPath, { removeAllClasses: true });

    const output = await readFile(join(tempDir, 'test.purified.html'), 'utf-8');
    expect(output).not.toContain('class=');
    expect(output).toContain('>ok</div>');
  });

  it('should handle .htm extension correctly', async () => {
    const inputPath = join(tempDir, 'page.htm');
    await writeFile(inputPath, '<p style="x">hi</p>', 'utf-8');

    const outputPath = await purifyHtmlFile(inputPath);

    expect(outputPath).toBe(join(tempDir, 'page.purified.htm'));
    const output = await readFile(outputPath, 'utf-8');
    expect(output).toContain('<p>hi</p>');
  });

  it('should throw for non-existent file', async () => {
    await expect(
      purifyHtmlFile(join(tempDir, 'nope.html')),
    ).rejects.toThrow();
  });
});
