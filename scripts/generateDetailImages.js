// Node.js script to generate 4 detail images from a main image for an artpiece folder
// Usage: node scripts/generateDetailImages.js "Art Piece Name"
// Requires: npm install sharp slugify

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const slugify = require('slugify');

const artpieceName = process.argv[2];
if (!artpieceName) {
  console.error('Usage: node scripts/generateDetailImages.js "Art Piece Name"');
  process.exit(1);
}

const slug = slugify(artpieceName, { lower: true, strict: true });
const folder = path.join(__dirname, '..', 'images', 'artpieces', slug);
const mainPath = path.join(folder, 'main.jpg');

if (!fs.existsSync(mainPath)) {
  console.error('main.jpg not found in', folder);
  process.exit(1);
}

const detailPaths = [1,2,3,4].map(i => path.join(folder, `detail${i}.jpg`));

(async () => {
  try {
    // detail1: blurred
    await sharp(mainPath).blur(12).toFile(detailPaths[0]);
    // detail2: center crop
    const { width, height } = await sharp(mainPath).metadata();
    const size = Math.min(width, height);
    await sharp(mainPath).extract({ left: Math.floor((width-size)/2), top: Math.floor((height-size)/2), width: size, height: size })
      .resize(400, 400)
      .toFile(detailPaths[1]);
    // detail3: grayscale
    await sharp(mainPath).grayscale().toFile(detailPaths[2]);
    // detail4: color tint
    await sharp(mainPath).tint({ r: 180, g: 200, b: 255 }).toFile(detailPaths[3]);
    console.log('Detail images generated for', artpieceName);
  } catch (err) {
    console.error('Error generating detail images:', err);
  }
})();
