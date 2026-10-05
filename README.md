# Gravity, Unscripted

A browser-based N-body laboratory for exploring gravitational motion, numerical error and sensitive dependence on initial conditions.

## Features

Figure-eight and regular-polygon orbits; Burrau sensitivity experiment; configurable live systems; error charts; guided tour and hands-free watch mode.

## Explore the lab

- **Watch the lab:** a captioned, roughly three-minute demonstration across all four experiments, including two live calculations.
- **The choreography:** move through eight real best-so-far search candidates and inspect return error.
- **The butterfly effect:** compare deterministic nearby starting states without presenting them as probabilities.
- **Your experiment:** change the initial conditions, calculate locally, and inspect the tighter-rerun disagreement.

Keyboard controls, a click-through tour, time-as-height visualization, and reproducible experiment links are included. The mathematics panel explains assumptions, numerical checks, visual conventions, and limitations.

## Architecture

- Authored ES modules and locally bundled Three.js render the interactive scene.
- A Web Worker runs adaptive Dormand–Prince 5(4) integration, then repeats it at tighter tolerance without blocking UI input.
- Preset trajectories and search data were calculated independently with SciPy and ship as static JSON.
- No backend, authentication, telemetry, or external computation service is required.

`npm run build` checks all JavaScript syntax. `npm test` covers UI/state flows, cancellation and startup failures, embedded dismissal, an analytic binary, and agreement with saved independent trajectories. These checks do not replace browser layout, WebGL, or real-device testing.

## Run locally

Use Node.js 22.13 or later. 

```sh
npm run build
npm test
npm run dev
```

Open the local URL printed by the development server (normally http://127.0.0.1:5173). Keep the development server on loopback.

## Data and configuration

No dependency installation or API keys are needed. Runtime assets are bundled; optional Google Fonts have system-font fallbacks.

## Deployment and source workflow

Serve `dist/` with a static web host. In this recovered project, `dist/` contains authored runtime source and necessary assets, not disposable build output. `npm start` serves it locally.

The existing ChatGPT Site remains independently hosted and was not redeployed or relinked. This repository is a version-controlled export, not an automatic two-way sync. Future changes can be reviewed here and deliberately ported to the original Site; never copy deployment identity or private data into a public commit.

## Provenance and validation

Recovered from the current ChatGPT Sites source checkout at commit `c557b16c038498fe11d7c38f10ed90df48255330`. The migration preserves application code and makes targeted portability/privacy edits. The Sites projects were developed with ChatGPT assistance; this is not represented as unaided work.

See `VALIDATION.md` for checks actually run during migration and their limitations. Historical validation notes, if retained, describe prior work rather than a new test result. No usage, performance or adoption claims are made.

## Licensing and attribution

No new blanket open-source license is assigned: the original project did not establish a complete redistribution license for all authored code/data/assets. Third-party notices remain in their original files. Public source visibility is not a license grant. Obtain appropriate rights before redistributing assets.
