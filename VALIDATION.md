# Migration validation

- Static JavaScript syntax build: passed.
- Existing UI/state regression suite: passed, including twelve watch chapters and two real solver runs.
- Local HTTP startup: 200, application HTML served successfully.
- No runtime package dependencies or API credentials are required.
- Staged-source and bundled calculation-archive inspection found no credentials or personal records.
- Original deployment was not altered.

Browser GPU rendering, touch behavior and real-device performance were not reverified by this migration. Numerical rerun agreement is not a rigorous error bound.


## Recruiter-readiness review · 5 October 2026

Changes preserve all four experiments, the 3D scene, time sculpture, numerical evidence, guided tour, twelve-chapter watch mode, live solver, and original calculation archive. The presentation uses tighter responsive spacing, a viewport-aware desktop stage, a sticky desktop scene, clearer action labels, and a visible demonstration duration.

Checks run against the final source:

- `npm run build`: passed for all authored and bundled `.js` and `.mjs` files.
- `npm test`: passed. The UI harness covers experiment switches, all search/future selections, six tour steps, twelve watch chapters, two real solver runs, interrupted work, failure continuation, and restoration.
- Added regression coverage passed for stale worker events after cancellation/restart; share-link fallback and force/speed restoration; planar versus spatial labels; tour Escape behavior; WebGL startup failure; accessible mathematics during failure; and trusted embedded dismissal.
- Independent saved-trajectory comparisons passed: maximum RMS position disagreement was 5.49e-9 (figure-eight), 6.13e-9 (triangle), and 6.18e-9 (ring) distance units.
- Analytic circular-binary comparison passed at 4.58e-12 maximum RMS position error. Energy conservation, centering, invalid inputs, and collision reporting checks passed.
- Local HTTP smoke check on port 5175: HTML, styles, icons, modules, trajectory data, and calculation archive returned 200.
- `git diff --check`: passed.

Verification limit: the managed cloud browser rejected the local development URL with `net::ERR_BLOCKED_BY_CLIENT`. No alternate browser channel was used. Desktop/mobile layout, WebGL pixels, native dialogs, clipboard permissions, touch gestures, and fullscreen must still be visually accepted on an approved preview or deployment. The DOM harness does not emulate browser rendering. No numerical integrator or trajectory data was changed, and rerun agreement is not a rigorous error bound.
