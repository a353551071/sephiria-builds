/**
 * gen-hero.mjs — regenerate public/images/hero.webp (the default OG share
 * image) from hero.svg + the official Steam capsule art.
 *
 * The SVG holds the dark-gold gradient, title text and the art's gold border
 * frame; this script composites the real capsule artwork into the frame (with
 * rounded corners to match the border) so the share card is game-native.
 *
 * Usage: node scripts/gen-hero.mjs
 * Deps: sharp (already a project dependency). No external network calls.
 */
import sharp from 'sharp';

// Panel geometry — must match the frame rect in public/images/hero.svg.
const PANEL = { left: 690, top: 189, width: 440, height: 252, radius: 12 };
const GOLD_BORDER = 4;

async function main() {
  const svg = await sharp('public/images/hero.svg').webp({ quality: 90 }).toBuffer();

  // Capsule art, scaled to the panel with matching rounded corners.
  const art = await sharp('public/images/sephiria-capsule.jpg')
    .resize(PANEL.width, PANEL.height)
    .composite([
      {
        // Rounded-corner mask (dest-in keeps art only inside the rounded rect).
        input: Buffer.from(
          `<svg width="${PANEL.width}" height="${PANEL.height}"><rect x="0" y="0" width="${PANEL.width}" height="${PANEL.height}" rx="${PANEL.radius}" fill="white"/></svg>`,
        ),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // Gold border, drawn *over* the art edge so it reads as a game card frame.
  const border = await sharp(
    Buffer.from(
      `<svg width="${PANEL.width}" height="${PANEL.height}"><rect x="${GOLD_BORDER / 2}" y="${GOLD_BORDER / 2}" width="${PANEL.width - GOLD_BORDER}" height="${PANEL.height - GOLD_BORDER}" rx="${PANEL.radius}" fill="none" stroke="#d8b45a" stroke-width="${GOLD_BORDER}"/></svg>`,
    ),
  )
    .png()
    .toBuffer();

  await sharp(svg)
    .composite([
      { input: art, left: PANEL.left, top: PANEL.top },
      { input: border, left: PANEL.left, top: PANEL.top },
    ])
    .webp({ quality: 90 })
    .toFile('public/images/hero.webp');

  const meta = await sharp('public/images/hero.webp').metadata();
  console.log(`hero.webp written: ${meta.width}x${meta.height} ${meta.format}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
