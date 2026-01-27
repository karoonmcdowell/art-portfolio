// Node.js script to scan images/artpieces and generate artpieces.json
// Usage: node scripts/generateArtpiecesJson.js
// Requires: npm install slugify

const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

const baseDir = path.join(__dirname, '..', 'images', 'artpieces');
const output = path.join(__dirname, '..', 'artpieces.json');

function getImageIfExists(...parts) {
  const p = path.join(...parts);
  return fs.existsSync(p) ? p.replace(/\\/g, '/') : null;
}

function scanArtpieces() {
  const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
  return folders.map(folder => {
    const folderPath = path.join(baseDir, folder);
    // Try to find main image
    let main = null;
    const mainDir = path.join(folderPath, 'main');
    if (fs.existsSync(mainDir)) {
      const files = fs.readdirSync(mainDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
      if (files.length) main = `images/artpieces/${folder}/main/${files[0]}`;
    }
    // Try to find detail images
    const details = [];
    ['detail', 'angle', 'room', 'extra'].forEach((sub, idx) => {
      const subDir = path.join(folderPath, sub);
      if (fs.existsSync(subDir)) {
        const files = fs.readdirSync(subDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
        if (files.length) details[idx] = `images/artpieces/${folder}/${sub}/${files[0]}`;
        else details[idx] = null;
      } else {
        details[idx] = null;
      }
    });
    return {
      id: slugify(folder, { lower: true, strict: true }),
      title: folder,
      images: [main, ...details],
      // Optionally add more metadata here
    };
  });
}

const data = scanArtpieces();
fs.writeFileSync(output, JSON.stringify(data, null, 2));
console.log('artpieces.json generated with', data.length, 'artpieces.');
