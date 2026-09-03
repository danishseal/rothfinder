import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

const origin = "https://rothfinder.com";
const outputRoot = join(process.cwd(), "public");
const seeds = [
  "/_nuxt/BarqSwx_.js",
  "/_nuxt/entry.CTY_jCXG.css",
  "/rive/hero-graph.riv",
  "/rive/icons.riv",
  "/rive/inner-scrolls.riv",
  "/rive/rothfinder-home.riv",
];

const externalAssets = new Map([
  ["https://unpkg.com/@rive-app/canvas@2.38.0/rive.wasm", "/rive/rive.wasm"],
  ["https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.38.0/rive_fallback.wasm", "/rive/rive_fallback.wasm"],
  ["https://www.datocms-assets.com/217501/1781631916-fpo-quote-2x.jpg", "/media/1781631916-fpo-quote-2x.jpg"],
  ["https://www.datocms-assets.com/217501/1781633279-transform-slide1-2x.avif", "/media/1781633279-transform-slide1-2x.avif"],
  ["https://www.datocms-assets.com/217501/1781633361-bg-product-2x.avif", "/media/1781633361-bg-product-2x.avif"],
  ["https://www.datocms-assets.com/217501/1781633607-transform-slide2-2x.avif", "/media/1781633607-transform-slide2-2x.avif"],
  ["https://www.datocms-assets.com/217501/1781633617-transform-slide3-2x.avif", "/media/1781633617-transform-slide3-2x.avif"],
  ["https://www.datocms-assets.com/217501/1781634108-cta-bg-2x.avif", "/media/1781634108-cta-bg-2x.avif"],
  ["https://www.datocms-assets.com/217501/1781634124-cta-bg-mob-2x.avif", "/media/1781634124-cta-bg-mob-2x.avif"],
  ["https://www.datocms-assets.com/217501/1782184090-favicon.png", "/media/1782184090-favicon.png"],
  ["https://www.datocms-assets.com/217501/1782415499-strategy-engine.png", "/media/1782415499-strategy-engine.png"],
  ["https://www.datocms-assets.com/217501/1782415511-projections.png", "/media/1782415511-projections.png"],
  ["https://www.datocms-assets.com/217501/1782415524-comparison.png", "/media/1782415524-comparison.png"],
  ["https://www.datocms-assets.com/217501/1782755196-angie-icon.png", "/media/1782755196-angie-icon.png"],
  ["https://www.datocms-assets.com/217501/1782755411-client-experience.png", "/media/1782755411-client-experience.png"],
  ["https://www.datocms-assets.com/217501/1782826362-1771375086-b3c4020d-8246-40e0-a0f3-0d6799c303bb.webp", "/media/1782826362-1771375086-b3c4020d-8246-40e0-a0f3-0d6799c303bb.webp"],
  ["https://www.datocms-assets.com/217501/1782862282-rothfinder-share.jpg", "/media/1782862282-rothfinder-share.jpg"],
  ["https://www.datocms-assets.com/217501/1782997693-4f7d6d44-ab80-48ca-b84c-938e68bdf5ef.png", "/media/1782997693-4f7d6d44-ab80-48ca-b84c-938e68bdf5ef.png"],
  ["https://www.datocms-assets.com/217501/1783020675-bg-menu-2x.avif", "/media/1783020675-bg-menu-2x.avif"],
]);

const assetExtension =
  /\.(?:avif|css|gif|jpe?g|js|json|mjs|mp4|otf|png|svg|ttf|webm|webp|woff2?)(?:[?#].*)?$/i;

function discoverReferences(source, assetPath) {
  const references = new Set();
  const add = (value) => {
    if (!value || value.startsWith("data:") || value.startsWith("blob:")) return;
    try {
      const resolved = new URL(value, new URL(assetPath, origin));
      if (resolved.origin === origin && assetExtension.test(resolved.pathname)) {
        references.add(resolved.pathname);
      }
    } catch {
      // Ignore strings that are not URLs.
    }
  };

  for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(match[1]);
  for (const match of source.matchAll(/["']((?:\.\.\/|\.\/|\/)[^"']+)["']/g)) add(match[1]);
  for (const match of source.matchAll(/https:\/\/rothfinder\.com\/[^"'`\s)]+/g)) add(match[0]);

  return references;
}

async function download(pathname) {
  const response = await fetch(new URL(pathname, origin), {
    headers: { "user-agent": "Mozilla/5.0 Rothfinder local mirror" },
  });
  if (!response.ok) throw new Error(`${response.status} ${pathname}`);

  const destination = join(
    outputRoot,
    decodeURIComponent(pathname.replace(/^\/+/, "")),
  );
  await mkdir(dirname(destination), { recursive: true });
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, body);
  process.stdout.write(`${response.status} ${pathname} (${body.length} bytes)\n`);
  return destination;
}

async function downloadExternal(url, pathname) {
  const response = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 Rothfinder local mirror" },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);

  const destination = join(
    outputRoot,
    decodeURIComponent(pathname.replace(/^\/+/, "")),
  );
  await mkdir(dirname(destination), { recursive: true });
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, body);
  process.stdout.write(`${response.status} ${url} -> ${pathname} (${body.length} bytes)\n`);
}

const queue = [...seeds];
const visited = new Set();

while (queue.length) {
  const pathname = queue.shift();
  if (visited.has(pathname)) continue;
  visited.add(pathname);

  try {
    const destination = await download(pathname);
    if ([".css", ".js", ".mjs"].includes(extname(pathname))) {
      const source = await readFile(destination, "utf8");
      for (const reference of discoverReferences(source, pathname)) {
        if (!visited.has(reference)) queue.push(reference);
      }
    }
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
  }
}

for (const [url, pathname] of externalAssets) {
  await downloadExternal(url, pathname);
}

process.stdout.write(
  `Mirrored ${visited.size} same-origin and ${externalAssets.size} external assets.\n`,
);
