import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../dist/portfolio-embed.js', import.meta.url), 'utf8');
function loadEmbed(referrer) {
  const sent = [], handlers = {};
  let tourOpen = false, dialogOpen = false;
  const parent = { postMessage: (message, origin) => sent.push({ message, origin }) };
  const document = {
    referrer, documentElement: { dataset: {} }, head: { appendChild() {} }, body: {},
    createElement: () => ({}),
    addEventListener: (name, handler) => { handlers[name] = handler; },
    querySelector: selector => selector.includes('dialog[open]') && dialogOpen || selector.includes('#tour-card:not([hidden])') && tourOpen ? {} : null,
  };
  vm.runInNewContext(source, { window: { parent }, parent, document, URL, MutationObserver: class { observe() {} }, addEventListener() {} });
  return { sent, handlers, setTour: open => { tourOpen = open; }, setDialog: open => { dialogOpen = open; } };
}
const embed = loadEmbed('https://mattvildibill.com/');
assert.equal(embed.sent[0].message.type, 'portfolio:ready');
embed.setTour(true);embed.handlers.keydown({ key: 'Escape' });assert.equal(embed.sent.length, 1);
embed.setTour(false);embed.setDialog(true);embed.handlers.keydown({ key: 'Escape' });assert.equal(embed.sent.length, 1);
embed.setDialog(false);embed.handlers.keydown({ key: 'Escape', defaultPrevented: true });assert.equal(embed.sent.length, 1);
embed.handlers.keydown({ key: 'Escape' });assert.equal(embed.sent[1].message.type, 'portfolio:close');
assert.equal(embed.sent[1].origin, 'https://mattvildibill.com');
const untrusted = loadEmbed('https://untrusted.example/');assert.equal(untrusted.sent.length, 0);assert.equal(untrusted.handlers.keydown, undefined);
console.log('PASS: embedded tour/dialog dismissal stays local; unhandled Escape closes only the trusted portfolio parent.');
