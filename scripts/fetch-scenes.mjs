// Downloads the menu scene photos listed in src/content/scenes.json from
// Wikimedia Commons and writes WebP renditions to src/assets/scenes/.
//
//   node scripts/fetch-scenes.mjs          # only missing files
//   node scripts/fetch-scenes.mjs --force  # re-download everything
//
// Originals are never committed; only the optimised renditions are.
import { mkdir, readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';

const WIDTHS = [768, 1280, 1920];
/** Widest aspect we ship. Taller photos are cropped around their focus point. */
const MAX_ASPECT_HEIGHT = 1 / 1.6;
const SOURCE_WIDTH = 2400;
const OUT_DIR = 'src/assets/scenes';
const USER_AGENT = 'portfolio-builder/1.0 (scene image script)';
const force = process.argv.includes('--force');

const scenes = JSON.parse(await readFile('src/content/scenes.json', 'utf8'));
await mkdir(OUT_DIR, { recursive: true });

const exists = (path) =>
  stat(path).then(
    () => true,
    () => false,
  );

async function thumbnailUrl(title) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  const params = {
    action: 'query',
    format: 'json',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: String(SOURCE_WIDTH),
  };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const page = Object.values((await res.json()).query.pages)[0];
  return page.imageinfo[0].thumburl;
}

for (const scene of scenes) {
  const outputs = WIDTHS.map((w) => `${OUT_DIR}/${scene.id}-${w}.webp`);
  if (!force && (await Promise.all(outputs.map(exists))).every(Boolean)) {
    console.log(`skip  ${scene.id}`);
    continue;
  }

  const res = await fetch(await thumbnailUrl(scene.title), {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`${scene.id}: HTTP ${res.status}`);
  const original = Buffer.from(await res.arrayBuffer());

  // Crop in original pixels (before resizing) so rounding can't overrun the edge.
  const { width: srcW, height: srcH } = await sharp(original).metadata();
  const focusY = Number.parseFloat(scene.position.split(' ')[1]) / 100;
  const cropH = Math.min(srcH, Math.round(srcW * MAX_ASPECT_HEIGHT));
  const crop = { left: 0, top: Math.round((srcH - cropH) * focusY), width: srcW, height: cropH };

  for (const [i, width] of WIDTHS.entries()) {
    const { size } = await sharp(original)
      .extract(crop)
      .resize({ width })
      // A whisper of blur: these sit behind text, and fine detail (nets, fences)
      // costs a lot of bytes while hurting legibility. `soften` adds more.
      .blur(0.6 + (scene.soften ?? 0))
      .webp({ quality: 68, effort: 6 })
      .toFile(outputs[i]);
    console.log(`write ${outputs[i]} (${Math.round(size / 1024)} KB)`);
  }
}
