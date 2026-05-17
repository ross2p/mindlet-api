/**
 * Rewrites @ross2p/* deps in ./package.json to file:../libs/<pkg>
 * so Docker builds work with COPY libs/* from monorepo root.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appDir = process.cwd();
const pkgPath = path.join(appDir, 'package.json');
const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const map = {
  '@ross2p/common': 'common',
  '@ross2p/types': 'types',
};

for (const dep of ['dependencies', 'devDependencies', 'peerDependencies']) {
  if (!p[dep]) continue;
  for (const [name, spec] of Object.entries(p[dep])) {
    const dir = map[name];
    if (!dir) continue;
    const libPath = path.join(root, 'libs', dir);
    if (fs.existsSync(libPath)) {
      p[dep][name] = `file:../libs/${dir}`;
    }
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2) + '\n');
