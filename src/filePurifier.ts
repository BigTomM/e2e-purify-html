import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, extname, join } from 'node:path';
import { purifyHtml } from './purifier';
import type { PurifyHtmlOptions } from './types';

export interface PurifyHtmlFileOptions extends Partial<PurifyHtmlOptions> {
  /**
   * Output file path. If omitted, defaults to `<name>.purified.html`
   * in the same directory as the input file.
   */
  output?: string;
}

/**
 * Read an HTML file, purify it, and write the result to an output file.
 *
 * @param inputPath - Path to the source HTML file
 * @param options - Purification options plus an optional `output` path
 * @returns The absolute path of the written output file
 */
export async function purifyHtmlFile(
  inputPath: string,
  options?: PurifyHtmlFileOptions,
): Promise<string> {
  const absInput = resolve(inputPath);
  const html = await readFile(absInput, 'utf-8');

  const { output, ...purifyOptions } = options ?? {};

  const purified = purifyHtml(html, purifyOptions);

  const absOutput = output
    ? resolve(output)
    : join(
        dirname(absInput),
        `${basename(absInput, extname(absInput))}.purified${extname(absInput)}`,
      );

  await writeFile(absOutput, purified, 'utf-8');
  return absOutput;
}
