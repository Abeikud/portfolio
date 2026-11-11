// Builds what GitHub Pages serves now that the site lives at www.abeikud.com:
// the redirect page as index.html (for /portfolio/) and 404.html (Pages
// serves it for every other old URL, e.g. /portfolio/projects/startingfive).
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'dist-pages';
const PAGE = 'pages-redirect/index.html';

await mkdir(OUT, { recursive: true });
for (const name of ['index.html', '404.html']) await copyFile(PAGE, join(OUT, name));
console.log(`pages-redirect: ${OUT}/index.html and ${OUT}/404.html written`);
