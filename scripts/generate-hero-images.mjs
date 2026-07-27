/**
 * Generates the responsive WebP variants of the hero image.
 *
 * These are committed rather than produced by astro:assets, because in
 * `output: "server"` Astro resolves getImage() at request time and serves the
 * variants from the /_image endpoint — i.e. a sharp resize inside the
 * serverless function, in front of the LCP. Committed files are imported by
 * src/lib/heroImage.ts, so Vite fingerprints them into /_astro/, which the
 * Vercel adapter serves as immutable with no runtime work.
 *
 * Re-run after replacing src/assets/images/npp.webp:
 *
 *   node scripts/generate-hero-images.mjs
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'src/assets/images/npp.webp';
const OUT_DIR = 'src/assets/images/hero';
const WIDTHS = [640, 960, 1280, 1920];

// The hero renders under a 60% black overlay, which masks compression noise, so
// a lower quality than usual is safe here.
const QUALITY = 68;

await mkdir(OUT_DIR, { recursive: true });

for (const width of WIDTHS) {
  await sharp(SOURCE)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(path.join(OUT_DIR, `npp-${width}.webp`));
}

const { size: sourceSize } = await stat(SOURCE);
console.log(`source  npp.webp${''.padEnd(8)} ${(sourceSize / 1024).toFixed(0)}KB`);
for (const file of (await readdir(OUT_DIR)).sort()) {
  const { size } = await stat(path.join(OUT_DIR, file));
  console.log(`output  ${file.padEnd(16)} ${(size / 1024).toFixed(0)}KB`);
}
