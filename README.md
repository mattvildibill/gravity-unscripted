# Gravity, Unscripted

I wanted to understand the n-body problem by changing the starting conditions and seeing what the simulations could show. This browser laboratory lets you explore a repeating orbit, nudge a body, and calculate a different future.

[Try a small change](https://gravity.mattvildibill.com/#chaos) · [My portfolio](https://mattvildibill.com)

## Try the lab

- **Figure-eight orbit:** three equal masses follow one repeating path. Scrub through eight actual best-so-far search candidates.
- **A tiny nudge:** compare two checked, almost identical initial states. Eight additional nearby starts load when needed; they are deterministic examples, not probabilities.
- **Balanced orbits:** compare the numerical motion of a triangle or octagon with an exact formula, then break its symmetry.
- **Your experiment:** change mass, speed or physical height. A worker calculates the orbit locally, repeats it more strictly, and reports how much the runs disagree.

The first action jumps into the checked starting-state comparison. The six-step tour explains each experiment; **Watch the lab** is a captioned, approximately three-minute demonstration with two live calculations. Time sculpture uses height to show elapsed time, which is different from physical vertical motion.

Keyboard camera controls, reduced-motion support, touch rotation, versioned experiment links and a source-mathematics dialog are included. Sharing captures the current starting conditions, including pending custom-form changes. A recipient explicitly calculates a custom recipe on their own device. If WebGL cannot start, a deliberate orbit diagram and direct mathematics/calculation links remain available.

## Run locally

Use Node.js 24. No dependency installation, backend, account or API keys are required.

```sh
npm run build
npm test
npm run dev
```

The local server stays on loopback. Set `PORT` to use a different port. `dist/` contains the authored application and required assets; it is not disposable build output.

## How it works

- `dist/physics.mjs` and `solver-worker.mjs`: adaptive Dormand–Prince 5(4) integration, cancellation and numerical checks.
- `dist/scene.mjs`: Three.js rendering, keyboard/touch camera controls and a bounded cache of recently viewed scenes.
- `dist/app.mjs`: experiment state, lazy nearby-future loading, tours, playback and computation lifecycle.
- `dist/charts.mjs`: logarithmic numerical evidence and magnified return miss.
- The saved presets were generated independently with SciPy. The downloadable calculation archive includes the original Python workflow and data.

Slider updates are coalesced to the display refresh. Only the small local icon subset is loaded; optional nearby futures do not gate the first orbit or the checked comparison pair. Google Fonts are optional, with system fallbacks.

## Accuracy and validation

The model uses Newtonian point masses, dimensionless units and no force softening. A known periodic orbit, exact regular-polygon motion and deterministic sensitivity are distinct demonstrations. Rerun agreement and energy conservation are useful checks, not rigorous global error bounds. Close encounters can stop a calculation with an explanation.

`npm run build` checks JavaScript syntax. `npm test` covers UI/state flows, all tour chapters, worker failure and cancellation, shared recipes, optional-data failure/recovery, an analytic binary and agreement with independent saved trajectories. Browser layout and graphics require separate verification; see [validation notes](VALIDATION.md).

The project was developed with AI-assisted tools. Its numerical assumptions, source references, implementation choices and verification are documented rather than represented as an unaided research result.

## Deployment and attribution

Vercel serves `dist/` from the GitHub repository; see [deployment](docs/DEPLOYMENT.md). Keep original mathematical sources and the Three.js and Lucide license notices. Public repository visibility is not a blanket redistribution license for every authored asset; obtain appropriate rights before redistributing.
