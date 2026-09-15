import fs from 'node:fs';
import path from 'node:path';
import wawoff2 from 'wawoff2';
import opentype from 'opentype.js';
import sharp from 'sharp';

async function generateOGImage() {
  const rootDir = process.cwd();
  const fontPath = path.join(rootDir, 'public/fonts/gotham-bold.woff2');
  const outputPath = path.join(rootDir, 'public/og-image.jpg');

  // Decompress Gotham Bold font
  const woff2Buf = fs.readFileSync(fontPath);
  const ttfBuf = await wawoff2.decompress(woff2Buf);
  const arrayBuffer = ttfBuf.buffer.slice(ttfBuf.byteOffset, ttfBuf.byteOffset + ttfBuf.byteLength);
  const font = opentype.parse(arrayBuffer);

  // Background: 1200 x 630 solid studio black (#000000)
  const bg = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .jpeg()
    .toBuffer();

  // Typography paths for 'A' and 'N' matching the exact homepage tracking and metrics
  // Base font size = 1000, cap height = 700 (0.70em)
  // K width = 700, gap between K and A = 60 (0.06em)
  // A advanceWidth = 790, tracking = 60
  const pathA = font.getPath('A', 760, 700, 1000);
  const pathN = font.getPath('N', 760 + 790 + 60, 700, 1000);
  const pathAData = pathA.toPathData(3);
  const pathNData = pathN.toPathData(3);

  // Scale K from 636x636 to 700x700: scale = 700 / 636
  const kScale = 700 / 636;

  // Total vector bounding box width = 2316, height = 705 (from y=-5 to y=700)
  // Target width = 480px (40% of 1200px canvas width for refined optical balance)
  const targetWidth = 480;
  const targetHeight = Math.round((705 / 2316) * targetWidth);

  const wordmarkSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 -5 2316 705">
      <g transform="scale(${kScale})">
        <rect x="0" y="0" width="166" height="636" rx="16" ry="16" fill="#ffffff" />
        <path d="M 426 0 L 636 0 L 370 284 L 166 336 L 206 240 Z" fill="#ffffff" />
        <path d="M 166 336 L 370 336 L 636 636 L 438 636 Z" fill="#ffffff" />
      </g>
      <path d="${pathAData}" fill="#ffffff" />
      <path d="${pathNData}" fill="#ffffff" />
    </svg>
  `);

  // Centered position on 1200x630
  const left = Math.round((1200 - targetWidth) / 2);
  const top = Math.round((630 - targetHeight) / 2);

  await sharp(bg)
    .composite([
      {
        input: wordmarkSvg,
        left,
        top,
      },
    ])
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(outputPath);

  console.log(`Generated Open Graph image at ${outputPath} (1200x630, Wordmark 40% width)`);

  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distOutputPath = path.join(distDir, 'og-image.jpg');
    fs.copyFileSync(outputPath, distOutputPath);
    console.log(`Synchronized Open Graph image to ${distOutputPath}`);
  }
}

generateOGImage().catch((err) => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
