# readest-dist

Personal build of [Readest](https://github.com/readest/readest) — a distribution
mirror only. The source lives in a private repo; what you find here is the
installers, their update signatures, and the `latest.json` manifest the app
reads to check for updates.

## Downloads

Grab the newest release on the [Releases](../../releases/latest) page:

- `Readest_<version>_x64-setup.exe` — Windows installer
- `Readest_<version>_universal.apk` — Android, arm64

The Android build is signed with a personal key, so it cannot be installed over
the official Readest app (and vice versa) — uninstall the official one first if
you are switching.

## How updates work

The app polls `releases/latest/download/latest.json`, downloads the artifact and
verifies it against the public key baked into the binary. `latest.json` and the
`*.sig` files in each release are what make that possible; `tools/make-latest-json.mjs`
assembles the manifest from those signatures after every build.

## Builds

`.github/workflows/build.yml` runs manually. It clones the private source over a
read-only deploy key, builds Windows and Android, signs both with the updater
key, and publishes a release.
