/**
 * Regenerate the favicon raster set from public/favicon.svg.
 *
 * Uses @resvg/resvg-js (already a dependency via gen-covers) — no new deps.
 * Outputs the PNG set + favicon.ico (PNG-in-ICO, supported by all modern
 * browsers) referenced by BaseLayout.astro and public/manifest.json.
 *
 * Run: node scripts/gen-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');

/** Render favicon.svg at the given width and return a PNG buffer. */
function render(size) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
}

const png16 = render(16);
const png32 = render(32);

writeFileSync(new URL('../public/favicon-16x16.png', import.meta.url), png16);
writeFileSync(new URL('../public/favicon-32x32.png', import.meta.url), png32);
writeFileSync(new URL('../public/android-chrome-192x192.png', import.meta.url), render(192));
writeFileSync(new URL('../public/android-chrome-512x512.png', import.meta.url), render(512));
writeFileSync(new URL('../public/apple-touch-icon.png', import.meta.url), render(180));

/** Build a favicon.ico container embedding 16px + 32px PNGs (Vista+ PNG-in-ICO). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dirs = [];
  for (const { size, data } of entries) {
    const d = Buffer.alloc(16);
    d[0] = size === 256 ? 0 : size; // width (0 = 256)
    d[1] = size === 256 ? 0 : size; // height (0 = 256)
    d[2] = 0; // palette colors
    d[3] = 0; // reserved
    d.writeUInt16LE(1, 4); // color planes
    d.writeUInt16LE(32, 6); // bits per pixel
    d.writeUInt32LE(data.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += data.length;
    dirs.push(d);
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.data)]);
}

writeFileSync(
  new URL('../public/favicon.ico', import.meta.url),
  buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ]),
);

console.log('Generated favicon-16x16.png, favicon-32x32.png, android-chrome-192/512, apple-touch-icon.png, favicon.ico');
