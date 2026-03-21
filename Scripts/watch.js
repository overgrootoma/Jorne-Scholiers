const path = require('path');
const fs = require('fs');
const { buildSite } = require('./generate-site');

const root = path.resolve(__dirname, '..');
const watchDirs = [path.join(root, 'Projects'), path.join(root, 'Archive')];

let timeout = null;

const triggerBuild = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    buildSite();
    console.log(`[watch] site regenerated at ${new Date().toISOString()}`);
  }, 200);
};

buildSite();

watchDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, triggerBuild);
});

console.log('[watch] watching Projects and Archive for changes...');
