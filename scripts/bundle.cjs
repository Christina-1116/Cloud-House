const fs = require('node:fs');
const path = require('node:path');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '..');
const result = buildSync({
  stdin: { contents: fs.readFileSync(0, 'utf8'), resolveDir: path.join(root, 'src'), sourcefile: 'cloud-house.mjs' },
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020'],
  // Escape shader newlines in string literals, keeping the HTML artifact compact.
  supported: { 'template-literal': false },
  minify: true,
  legalComments: 'inline',
  write: false,
  alias: {
    'three/addons': path.join(root, 'public/vendor/three/addons'),
    'three': path.join(root, 'public/vendor/three/three.module.js'),
    '@tweenjs/tween.js': path.join(root, 'public/vendor/tween/tween.esm.js'),
  },
});
process.stdout.write(result.outputFiles[0].text);
