const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const LEAF_PATH =
  "M41.2 6.4C26.4 6.6 13.1 15.2 10.6 28.7c-1.1 6 1 10.7 4.6 13.1 1.6 1.1 3.6 1.1 5.1 0 11.9-8.6 19.9-20.9 22-33.4.2-1.3-.3-2.1-1.1-2Z";

function leafGroup(scale, { fill = "url(#leaf-gradient)", line = "#F7FCF8" } = {}) {
  const size = 48 * scale;
  const offset = (512 - size) / 2;
  return `<g transform="translate(${offset} ${offset}) scale(${scale})">
    <path d="${LEAF_PATH}" fill="${fill}" />
    <path d="M13.2 41.3C19.7 33.1 27.3 24.3 36.7 15.2" stroke="${line}" stroke-width="1.7" stroke-linecap="round" opacity="0.94" />
    <path d="M22.7 30.5c2.7.1 5.2.5 7.7 1.3M28.4 23.4c2.2.1 4.2.4 6.1 1M17.5 36.4c1.5 0 2.9.2 4.3.5" stroke="${line}" stroke-width="1.25" stroke-linecap="round" opacity="0.6" />
  </g>`;
}

function defs() {
  return `<defs>
    <linearGradient id="leaf-gradient" x1="10" y1="42" x2="42" y2="6" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1F6A48" />
      <stop offset="0.55" stop-color="#2F8A60" />
      <stop offset="1" stop-color="#54B181" />
    </linearGradient>
  </defs>`;
}

function regularIcon({ scale = 6.7 } = {}) {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="512" height="512" fill="#EAF4EC" />
    <circle cx="256" cy="256" r="212" fill="#FFFFFF" />
    ${leafGroup(scale)}
  </svg>`;
}

function maskableIcon({ scale = 5.1 } = {}) {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${defs()}
    <rect width="512" height="512" fill="#2F8A60" />
    <circle cx="256" cy="256" r="196" fill="#F4FBF5" opacity="0.16" />
    ${leafGroup(scale, { fill: "#F4FBF5", line: "#2F8A60" })}
  </svg>`;
}

const outputDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outputDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, source: regularIcon() },
  { file: "icon-512.png", size: 512, source: regularIcon() },
  { file: "maskable-192.png", size: 192, source: maskableIcon() },
  { file: "maskable-512.png", size: 512, source: maskableIcon() },
  { file: "apple-touch-icon.png", size: 180, source: regularIcon() },
];

(async () => {
  for (const target of targets) {
    await sharp(Buffer.from(target.source))
      .resize(target.size, target.size)
      .png()
      .toFile(path.join(outputDir, target.file));
  }
  await sharp(Buffer.from(regularIcon()))
    .resize(512, 512)
    .png()
    .toFile(path.join(process.cwd(), "src", "app", "icon.png"));
  console.log("Generated RESET icons.");
})();
