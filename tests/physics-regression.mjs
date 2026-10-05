import assert from 'node:assert/strict';
import fs from 'node:fs';
import { center, compare, simulate } from '../dist/physics.mjs';

// An equal-mass circular binary has radius 1, omega = 1/2, and period 4π.
const binary = { q: [[1, 0, 0], [-1, 0, 0]], v: [[0, .5, 0], [0, -.5, 0]], m: [1, 1], T: 4 * Math.PI, samples: 501, tol: 1e-10 };
const orbit = simulate(binary);
const exact = { positions: orbit.t.map(t => [[Math.cos(t / 2), Math.sin(t / 2), 0], [-Math.cos(t / 2), -Math.sin(t / 2), 0]]) };
const binaryError = Math.max(...compare(orbit, exact));
assert.ok(binaryError < 1e-7, `Binary RMS error ${binaryError}`);
assert.ok(orbit.diagnostics.maxEnergyDrift < 1e-8);
assert.ok(orbit.positions.every(row => row.flat().every(Number.isFinite)));

// Compare a new integration against the saved independent SciPy trajectories.
const { scenarios } = JSON.parse(fs.readFileSync(new URL('../dist/trajectories.json', import.meta.url), 'utf8'));
for (const id of ['figure8', 'triangle', 'ring']) {
  const saved = scenarios.find(item => item.id === id);
  const result = simulate({ q: saved.initial.positions.map(p => [...p, 0]), v: saved.initial.velocities.map(p => [...p, 0]), m: saved.masses, T: saved.t.at(-1), samples: saved.t.length, tol: 1e-10 });
  const reference = { positions: saved.positions.map(row => row.map(p => [...p, 0])) };
  const error = Math.max(...compare(result, reference));
  assert.ok(error < 1e-6, `${id} saved-trajectory RMS disagreement ${error}`);
  console.log(`PASS: ${id} independent saved-trajectory comparison (${error.toExponential(2)} RMS units).`);
}

const centered = center([[1, 2, 3], [4, 5, 6]], [[.1, .2, .3], [.4, .5, .6]], [1, 3]);
for (let axis = 0; axis < 3; axis++) {
  assert.ok(Math.abs(centered.q.reduce((sum, p, i) => sum + p[axis] * centered.m[i], 0)) < 1e-12);
  assert.ok(Math.abs(centered.v.reduce((sum, p, i) => sum + p[axis] * centered.m[i], 0)) < 1e-12);
}
assert.throws(() => simulate({ ...binary, m: [0, 1] }), /positive masses/);
assert.throws(() => simulate({ ...binary, T: 100 }), /duration/);
assert.throws(() => simulate({ ...binary, q: [[0, 0, 0], [0, 0, 0]] }), /collision/);
console.log(`PASS: analytic binary (${binaryError.toExponential(2)} RMS units), energy conservation, centering, input validation, and collision reporting.`);
