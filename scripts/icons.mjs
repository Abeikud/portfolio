// Builds the "D." monogram icon set: favicon.svg, PNG favicons, favicon.ico,
// the Apple touch icon and the web-app manifest icons. Run with `npm run icons`.
//
// The letters are Barlow ExtraBold outlines (the site's typeface, SIL OFL),
// converted to paths so the icon never depends on a font being installed.
// The 3D look is a solid-colour extrusion: flat faces only, no gradients,
// filters or glow, so it stays crisp down to 16 px.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const OUT = process.argv[2] ?? 'public';

export const COLORS = {
  tile: '#17191F', // charcoal background
  face: '#FFFFFF', // letter face
  side: '#4A4F5A', // extruded sides
};

// Barlow ExtraBold (800), 1000 units/em, baseline at y = 0, y pointing down.
const D =
  'M61 0Q56 0 52.5-3.5Q49-7 49-12L49-688Q49-693 52.5-696.5Q56-700 61-700L316-700Q394-700 454-673Q514-646 547-596Q580-546 580-481L580-219Q580-154 547-104Q514-54 454-27Q394 0 316 0L61 0ZM215-147Q215-142 220-142L323-142Q363-142 388-170.5Q413-199 414-247L414-453Q414-501 388.5-529.5Q363-558 322-558L220-558Q215-558 215-553L215-147Z';
const DOT =
  'M128 6Q90 6 65.5-18.5Q41-43 41-81Q41-120 65.5-144Q90-168 128-168Q166-168 190-144Q214-120 214-81Q214-43 189.5-18.5Q165 6 128 6Z';
const DOT_X = 600; // advance of D (618) tightened slightly for a monogram
const BOX = { x1: 49, y1: -700, x2: DOT_X + 214, y2: 6 }; // ink bounds of "D."

const round = (n) => Math.round(n * 100) / 100;

/** Moves and scales absolute path data (M/L/Q/Z only) into icon space. */
function place(d, { dx = 0, scale, x, y }) {
  let isX = true;
  return d
    .match(/[MLQZ]|-?\d*\.?\d+/g)
    .map((token) => {
      if (/[MLQZ]/.test(token)) return token;
      const v = isX ? x + (Number(token) + dx) * scale : y + Number(token) * scale;
      isX = !isX;
      return round(v);
    })
    .join(' ')
    .replace(/ ?([MLQZ]) ?/g, '$1')
    .replace(/ -/g, '-');
}

/**
 * One icon as SVG.
 * @param {object} o
 * @param {number} o.width  share of the tile the letters span (0-1)
 * @param {number} o.radius corner radius as a share of the tile (0 = full bleed)
 * @param {number} o.depth  extrusion depth as a share of the tile
 * @param {number} [o.grid] snap edges to this many units (4 = whole pixels at 16 px)
 */
export function iconSvg({ width, radius, depth, grid = 0, colors = COLORS }) {
  const size = 64;
  const snap = (n) => (grid ? Math.round(n / grid) * grid : n);
  const scale = (width * size) / (BOX.x2 - BOX.x1);
  const inkW = (BOX.x2 - BOX.x1) * scale;
  const capH = -BOX.y1 * scale;
  const ext = snap(depth * size);
  // Centre the letters plus their extrusion; on small icons the stem's left
  // edge, the cap line and the extrusion land on whole pixels.
  const x = snap((size - inkW - ext) / 2) - BOX.x1 * scale;
  const y = snap((size - capH - ext) / 2) + capH;
  const glyphs = `${place(D, { scale, x, y })}${place(DOT, { dx: DOT_X, scale, x, y })}`;

  const steps = Math.max(1, Math.round(ext / 0.25));
  const sides = Array.from({ length: steps }, (_, i) => {
    const o = round((ext * (steps - i)) / steps);
    return `<use href="#m" x="${o}" y="${o}"/>`;
  }).join('');
  const r = round(radius * size);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`,
    `<title>D.</title>`,
    `<defs><path id="m" fill-rule="evenodd" d="${glyphs}"/></defs>`,
    `<rect width="${size}" height="${size}"${r ? ` rx="${r}"` : ''} fill="${colors.tile}"/>`,
    `<g fill="${colors.side}">${sides}</g>`,
    `<use href="#m" fill="${colors.face}"/>`,
    `</svg>`,
    '',
  ].join('\n');
}

// Small sizes get bigger letters and a whole-pixel extrusion; home-screen
// icons get room to breathe (iOS and Android add their own rounded mask).
export const PRESETS = {
  tab: { width: 0.7, radius: 0.19, depth: 0.0625, grid: 4 },
  home: { width: 0.58, radius: 0, depth: 0.035 },
  app: { width: 0.58, radius: 0.19, depth: 0.035 },
  maskable: { width: 0.5, radius: 0, depth: 0.035 }, // inside Android's 80% safe zone
};

const png = (svg, px) =>
  sharp(Buffer.from(svg), { density: (72 * px) / 64 })
    .resize(px, px)
    .png({ compressionLevel: 9 })
    .toBuffer();

/** Packs PNGs into an .ico (PNG-in-ICO, supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ px, data }, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(px % 256, at);
    header.writeUInt8(px % 256, at + 1);
    header.writeUInt16LE(1, at + 4); // colour planes
    header.writeUInt16LE(32, at + 6); // bits per pixel
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const tab = iconSvg(PRESETS.tab);
  const files = {
    'favicon.svg': tab,
    'favicon-16x16.png': await png(tab, 16),
    'favicon-32x32.png': await png(tab, 32),
    'apple-touch-icon.png': await sharp(await png(iconSvg(PRESETS.home), 180))
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer(),
    'icon-192.png': await png(iconSvg(PRESETS.app), 192),
    'icon-512.png': await png(iconSvg(PRESETS.app), 512),
    'icon-maskable-512.png': await sharp(await png(iconSvg(PRESETS.maskable), 512))
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toBuffer(),
    'favicon.ico': ico(
      await Promise.all([16, 32, 48].map(async (px) => ({ px, data: await png(tab, px) }))),
    ),
  };
  for (const [name, data] of Object.entries(files)) {
    await writeFile(join(OUT, name), data);
    console.log(`icons: ${join(OUT, name)} (${(data.length / 1024).toFixed(1)} KB)`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
