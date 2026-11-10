// GitHub Pages serves 404.html for unknown paths. Copying the SPA shell there
// lets deep links like /portfolio/projects/startingfive boot the app.
import { copyFile } from 'node:fs/promises';

await copyFile('dist/index.html', 'dist/404.html');
console.log('spa-fallback: dist/404.html written');
