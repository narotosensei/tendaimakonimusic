import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const imagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/images");
const sources = (await readdir(imagesDir)).filter((name) => /\.(jpe?g|png)$/i.test(name));

const maxWidthFor = (name) => {
  if (/mug|sticker|cover/i.test(name)) return 1000;
  if (/icon|apple/i.test(name)) return 512;
  return 1600;
};

for (const name of sources) {
  const input = path.join(imagesDir, name);
  const base = name.replace(/\.(jpe?g|png)$/i, "");
  const webpOut = path.join(imagesDir, `${base}.webp`);
  const avifOut = path.join(imagesDir, `${base}.avif`);
  const maxWidth = maxWidthFor(name);
  const original = sharp(input).rotate();
  const meta = await original.metadata();
  const width = meta.width && meta.width > maxWidth ? maxWidth : meta.width;

  const pipeline = () => {
    const image = sharp(input).rotate();
    return width ? image.resize({ width, withoutEnlargement: true }) : image;
  };

  await pipeline().webp({ quality: 72, effort: 5 }).toFile(webpOut);
  await pipeline().avif({ quality: 45, effort: 4 }).toFile(avifOut);

  const before = (await stat(input)).size;
  const webp = (await stat(webpOut)).size;
  const avif = (await stat(avifOut)).size;
  console.log(
    `${name}: ${(before / 1024).toFixed(0)}KB → webp ${(webp / 1024).toFixed(0)}KB, avif ${(avif / 1024).toFixed(0)}KB`,
  );
}

console.log(`Optimized ${sources.length} images`);
