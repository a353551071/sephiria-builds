#!/usr/bin/env node
// IndexNow ping — notify Bing / Yandex / Seznam / Naver to recrawl changed URLs immediately.
// Great for a content-pulse site: every newly published page can be pushed to Bing in hours.
//
// Setup (one-time, done):
//   A key file public/<KEY>.txt is deployed and served at
//   https://sephiriabuilds.xyz/<KEY>.txt (content == KEY).
//   IndexNow fetches that file to confirm domain ownership before it accepts the ping.
//
// Usage:
//   node scripts/indexnow.mjs https://sephiriabuilds.xyz/builds/<slug> [more urls...]
//   (or pnpm indexnow <url> [<url>...] — see package.json)
//
// Host is the APEX (sephiriabuilds.xyz): the site's canonical is apex, www 307->apex,
// and the key file is served at https://sephiriabuilds.xyz/<KEY>.txt.
//
// Behind a proxy / GFW where Node fetch cannot reach api.indexnow.org, use curl instead:
//   curl -X POST -H "Content-Type: application/json" \
//     -d "{\"host\":\"sephiriabuilds.xyz\",\"key\":\"<KEY>\",\"keyLocation\":\"https://sephiriabuilds.xyz/<KEY>.txt\",\"urlList\":[\"<URL>\"]}" \
//     -x http://127.0.0.1:7890 https://api.indexnow.org/indexnow

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = 'sephiriabuilds.xyz';
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Single source of truth: read the key from the deployed key file in public/.
const keyFileName = readdirSync(publicDir).find((f) => /^[0-9a-f]{8,128}\.txt$/.test(f));
if (!keyFileName) {
  console.error('No IndexNow key file found in public/ (expected a <hex>.txt file).');
  process.exit(1);
}
const KEY = keyFileName.replace(/\.txt$/, '');
const KEY_LOCATION = `https://${HOST}/${keyFileName}`;

const urls = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (urls.length === 0) {
  console.error('Usage: node scripts/indexnow.mjs <url> [<url>...]');
  process.exit(1);
}

const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls });

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  // 200 = done; 202 = accepted, key still being validated; 422 = key file unreachable/mismatched.
  console.log(`IndexNow ${res.status} ${res.statusText} — ${urls.length} URL(s), key ${KEY}`);
  urls.forEach((u) => console.log(`  ${u}`));
} catch (err) {
  console.error(`IndexNow ping failed: ${err.message}`);
  console.error(
    'If you are behind a proxy/GFW, Node fetch cannot reach api.indexnow.org — use the curl form in this file header with -x http://127.0.0.1:7890.',
  );
  process.exit(1);
}
