// Assembles the Tauri update manifest from the signatures attached to a release.
//
// Run by the `manifest` job after the platform builds have uploaded their
// artifacts. Reads <artifact>.sig files from ./dl and writes latest.json +
// release-notes.json next to it. Exits non-zero when nothing was signed, so a
// half-finished build never replaces a working manifest.
import fs from 'node:fs';
import path from 'node:path';

const version = process.env['VERSION'];
const tag = process.env['TAG'];
const repo = process.env['GITHUB_REPOSITORY'];
if (!version || !tag || !repo) {
  console.error('VERSION, TAG and GITHUB_REPOSITORY are required');
  process.exit(1);
}

const base = `https://github.com/${repo}/releases/download/${tag}`;
const read = (name) => {
  try {
    return fs.readFileSync(path.join('dl', name), 'utf8').trim();
  } catch {
    return null;
  }
};

const platforms = {};

const windows = read(`Readest_${version}_x64-setup.exe.sig`);
if (windows) {
  platforms['windows-x86_64'] = {
    signature: windows,
    url: `${base}/Readest_${version}_x64-setup.exe`,
  };
}

const android = read(`Readest_${version}_universal.apk.sig`);
if (android) {
  // Readest resolves the arm64 ABI to the `android-arm64` key
  // (src/helpers/updater.ts::getAndroidPlatformKey). The `android-universal`
  // alias stays for installs that still look it up.
  platforms['android-arm64'] = {
    signature: android,
    url: `${base}/Readest_${version}_universal.apk`,
  };
  platforms['android-universal'] = platforms['android-arm64'];
}

if (Object.keys(platforms).length === 0) {
  console.error('no signatures found, refusing to publish an empty manifest');
  process.exit(1);
}

const manifest = {
  version,
  notes: `Readest ${version} (personal build)`,
  pub_date: new Date().toISOString(),
  platforms,
};
fs.writeFileSync('latest.json', `${JSON.stringify(manifest, null, 2)}\n`);

// The app also fetches release-notes.json from the same base URL to show what
// changed on first launch after an update.
fs.writeFileSync(
  'release-notes.json',
  `${JSON.stringify({ releases: { [version]: { notes: [`Readest ${version} (personal build)`] } } }, null, 2)}\n`,
);

console.log(fs.readFileSync('latest.json', 'utf8'));
