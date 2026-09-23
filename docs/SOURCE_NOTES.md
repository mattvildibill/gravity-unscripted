# Gravity, Unscripted

A static, public gravitational laboratory. The complete application lives in
`dist/`; it has no backend, authentication, billing, or private user data.

The four experiments cover the known equal-mass figure-eight, finite-time
sensitivity in Burrau's three-body problem, exact regular-polygon motion,
and user-configured live systems with up to eight bodies. The 3D camera and
time-as-height view preserve their distinct scientific meanings in visible copy.

## Implementation

- `scene.mjs`: Three.js 0.180.0 scene, orbit controls, trajectory tubes,
  comparison states, nearby-future paths, and gravity directions.
- `app.mjs`: experiments, guided tour, playback, search, live configuration.
- `physics.mjs` / `solver-worker.mjs`: unsoftened Newtonian gravity and adaptive
  Dormand–Prince 5(4), with a second run using tighter tolerance and smaller steps.
- `charts.mjs`: measured logarithmic error plots and magnified position closure.
- JSON data files: previously computed DOP853 trajectories, actual record-low
  shooting candidates, and eight deterministic nearby initial conditions.

Three.js and Lucide are locally served with their licenses. Optional Google
Fonts fall back to system fonts. No visitor API key is required.

## Validation

The preset numerical pipeline was reproduced end to end. The new JavaScript
solver was compared against the original SciPy trajectories and against tighter
JavaScript reruns. A DOM execution harness exercised experiment switches, all
search/future selections, live solver configurations, playback, the guided tour,
camera-mode state, and the mathematics dialog. Three.js trajectory geometry was
checked for finite coordinates. These programmatic tests do not substitute for
complete browser visual verification.

Rerun agreement is not a rigorous global error bound. A persistent status marks
live results with large numerical discrepancies. Rendered interpolation and body
radii are illustrative; the time view adds elapsed time as height. The extra
ensemble members are not probabilities and have energy checks only.

The downloadable archive contains the original Python calculation workflow and
the extended search/ensemble data generation script.

## September 2026 review

Six independent read-only reviews covered physics, visual design, UX,
accessibility, reliability, and regression testing. Fixes include time-parametric
trajectory tubes (previously arc-length clipping detached trails from bodies),
aspect-aware framing, scale-normalized fog, fullscreen transport, reproducible
versioned experiment links, touch scroll/rotate modes, keyboard camera navigation,
non-overlapping tour placement, worker recovery, and correct metric labels.

Custom numerical warnings use a heuristic threshold: maximum RMS rerun position
disagreement divided by the shortest initial body spacing exceeds 0.001. This is
not a rigorous error bound. Shared custom links load a recipe; the recipient
explicitly calculates it locally. Camera orientation is not serialized.

Run `node tests/ui-regression.mjs` for a mocked-DOM control/state regression test.
It does not execute WebGL or certify browser layout. Separate mathematical tests
verified the live solver against an analytic binary and saved SciPy results, and
checked actual Three.js tube geometry against time-matched body positions.

Remaining release limitation: browser visual QA was unavailable in the managed
static-site preview environment. Real-device layout, touch gestures, fullscreen,
and assistive-technology behavior still require manual acceptance testing.

## Hands-free watch mode

“Watch the lab” runs twelve captioned chapters over approximately three minutes,
using the real scene and two fresh worker calculations. Playback waits for the
worker, advances past reported failures, pauses while the document is hidden,
and provides Pause/Resume and Exit (Escape). Reduced-motion preference disables
automatic camera drift. Exiting restores the prior experiment and form settings.
The demonstration temporarily makes the surrounding controls inert and confines
keyboard focus to its playback controls. The original click-through guided tour
remains available.

The regression harness exercises all twelve automatic chapters, real numerical
results for both live scenes, pause/resume, interrupted computation, failure
continuation, and restoration of the prior custom result and input recipe.
