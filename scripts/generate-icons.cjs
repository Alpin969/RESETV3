const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const LEAF = `
  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
`;

function svg({ scale, stroke = 1.75, background = "#23845B" }) {
  const size = 24 * scale;
  const offset = (512 - size) / 2;
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="${background}" />
    <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="#FFFFFF" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
      ${LEAF}
    </g>
  </svg>`;
}

const outputDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outputDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, source: svg({ scale: 16 }) },
  { file: "icon-512.png", size: 512, source: svg({ scale: 16 }) },
  { file: "maskable-192.png", size: 192, source: svg({ scale: 12.2, stroke: 1.9 }) },
  { file: "maskable-512.png", size: 512, source: svg({ scale: 12.2, stroke: 1.9 }) },
  { file: "apple-touch-icon.png", size: 180, source: svg({ scale: 16 }) },
];

(async () => {
  for (const target of targets) {
    await sharp(Buffer.from(target.source))
      .resize(target.size, target.size)
      .png()
      .toFile(path.join(outputDir, target.file));
  }
  await sharp(Buffer.from(svg({ scale: 16 })))
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), "src", "app", "icon.png"));
  console.log("Generated RESET icons.");
})();