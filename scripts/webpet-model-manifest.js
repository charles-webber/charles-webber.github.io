'use strict';

// Generate a small manifest at build time instead of hard-coding a model file
// name. Plain assets under source/pet/models are still copied unchanged by Hexo.
const fs = require('fs');
const path = require('path');

function walk(directory, entries) {
  if (!fs.existsSync(directory)) return entries;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute, entries);
    else if (entry.isFile() && entry.name.endsWith('.model3.json')) entries.push(absolute);
  }
  return entries;
}

hexo.extend.generator.register('webpet-model-manifest', function () {
  const modelsDirectory = path.join(hexo.source_dir, 'pet', 'models');
  const manifest = {};
  walk(modelsDirectory, []).forEach((absolute) => {
    const relative = path.relative(modelsDirectory, absolute).split(path.sep);
    const id = relative[0];
    if (!id || manifest[id]) return;
    manifest[id] = {
      id,
      path: '/pet/models/' + relative.join('/')
    };
  });

  return {
    path: 'pet/model-manifest.js',
    data: 'window.WEBPET_MODEL_MANIFEST = ' + JSON.stringify(manifest, null, 2) + ';\n'
  };
});
