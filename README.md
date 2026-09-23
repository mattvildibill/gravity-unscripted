# Gravity, Unscripted

A browser-based N-body laboratory for exploring gravitational motion, numerical error and sensitive dependence on initial conditions.

## Features

Figure-eight and regular-polygon orbits; Burrau sensitivity experiment; configurable live systems; error charts; guided tour and hands-free watch mode.

## Architecture

Static JavaScript modules, Three.js, Web Workers; bundled numerical trajectory datasets.

## Run locally

Use Node.js 22.13 or later. 

```sh
npm install
npm run build
npm test
npm run dev
```

Open the local URL printed by the development server (normally http://127.0.0.1:5173). Keep the development server on loopback.

## Data and configuration

No API keys. Runtime assets are bundled; optional Google Fonts have system-font fallbacks.

## Deployment and source workflow

Serve `dist/` with a static web host. In this recovered project, `dist/` contains authored runtime source and necessary assets, not disposable build output. `npm start` serves it locally.

The existing ChatGPT Site remains independently hosted and was not redeployed or relinked. This repository is a version-controlled export, not an automatic two-way sync. Future changes can be reviewed here and deliberately ported to the original Site; never copy deployment identity or private data into a public commit.

## Provenance and validation

Recovered from the current ChatGPT Sites source checkout at commit `c557b16c038498fe11d7c38f10ed90df48255330`. The migration preserves application code and makes targeted portability/privacy edits. The Sites projects were developed with ChatGPT assistance; this is not represented as unaided work.

See `VALIDATION.md` for checks actually run during migration and their limitations. Historical validation notes, if retained, describe prior work rather than a new test result. No usage, performance or adoption claims are made.

## Licensing and attribution

No new blanket open-source license is assigned: the original project did not establish a complete redistribution license for all authored code/data/assets. Third-party notices remain in their original files. Public source visibility is not a license grant. Obtain appropriate rights before redistributing assets.
