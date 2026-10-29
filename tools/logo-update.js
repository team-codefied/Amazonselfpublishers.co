// Regenerates all brand assets from the owner-supplied logo (v2). Usage: node tools/logo-v3.js <path-to-source>
const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const src = process.argv[2];
const root = path.join(__dirname, '..');
const bk = path.join(root, '_backup_original_assets');
const out = path.join(root, 'site/assets/img/brand/');
(async () => {
  // keep the previous brand assets as a backup before overwriting
  const old = path.join(bk, 'brand-v2/'); fs.mkdirSync(old, { recursive: true });
  for (const f of fs.readdirSync(out)) fs.copyFileSync(out + f, old + f);
  fs.copyFileSync(src, path.join(bk, 'new-logo-v3-source' + path.extname(src)));
  const meta = await sharp(src).metadata(); console.log('source', meta.width, meta.height);
  const t = await sharp(src).trim({ background: '#000000', threshold: 30 }).toBuffer({ resolveWithObject: true });
  const pad = Math.round(t.info.width * 0.03);
  const buf = await sharp(t.data).extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#000000' }).toBuffer();
  const m = await sharp(buf).metadata(); console.log('trimmed', m.width, m.height);
  await sharp(buf).resize({ width: 720 }).webp({ quality: 92 }).toFile(out + 'logo-trimmed-v3.webp');
  await sharp(buf).resize({ width: 720 }).png().toFile(out + 'logo-trimmed-v3.png');
  await sharp(buf).resize({ width: 360 }).webp({ quality: 92 }).toFile(out + 'logo-trimmed-360.webp');
  const o = await sharp(out + 'logo-trimmed-v3.webp').metadata(); console.log('final webp', o.width, o.height);
  // square versions from the full original artwork (it is square already)
  await sharp(src).png().toFile(out + 'logo-new-original.png');
  await sharp(src).resize(640).webp({ quality: 92 }).toFile(out + 'logo.webp');
  await sharp(src).resize(640).png().toFile(out + 'logo-640.png');
  await sharp(src).resize(180, 180).png().toFile(out + 'apple-touch-icon-v3.png');
  await sharp(src).resize(48, 48).png().toFile(out + 'favicon-48.png');
  await sharp(src).resize(32, 32).png().toFile(out + 'favicon-32-v3.png');
  await sharp(src).resize(1200, 630, { fit: 'contain', background: '#000' }).jpeg({ quality: 88 }).toFile(out + 'og-image-v3.jpg');
})();
