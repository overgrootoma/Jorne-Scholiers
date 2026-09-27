const path = require('path');
const fs = require('fs');
const { buildSite } = require('./generate-site');

const root = path.resolve(__dirname, '..');
const watchDirs = ['Projects', 'Archive', 'photography', 'content'].map((dir) => path.join(root, dir));

let timeout = null;

const triggerBuild = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    try {
      buildSite();
      console.log(`[watch] site regenerated at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[watch] build failed: ${err.message}`);
    }
  }, 200);
};

buildSite();

watchDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) return;
  fs.watch(dir, { recursive: true }, triggerBuild);
});

console.log('[watch] watching Projects, Archive, photography and content for changes...');
