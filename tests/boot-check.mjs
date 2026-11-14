// Boot guard: evaluates the client module exactly as the loader does, then runs apply against a
// context that has only the shell services. A module-scope throw or a blocking dependency here
// would keep the entry in 'loading' and fail the whole web boot, so this test keeps it cheap.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');

let captured = null;
const window = { __ModuleLoader__: { load: (entry) => { captured = entry; } } };

const React = {
  Fragment: 'fragment',
  useState: (value) => [value, () => {}],
  useEffect: () => {},
  useRef: () => ({ current: null }),
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
};

const timers = [];
const styles = new Set();
const listeners = new Map();
const observers = new Set();
const document = {
  body: {},
  head: { appendChild: (node) => { styles.add(node); } },
  createElement: (tag) => ({ tag, dataset: {}, textContent: '', remove() { styles.delete(this); } }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: (type, fn) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(fn);
  },
  removeEventListener: (type, fn) => { listeners.get(type)?.delete(fn); },
};

const errors = [];
const context = vm.createContext({
  window, React, document, console: { error: (...parts) => errors.push(parts.map(String).join(' ')) },
  setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
  clearTimeout: () => {},
  requestAnimationFrame: () => 1,
  cancelAnimationFrame: () => {},
  ResizeObserver: function ResizeObserver() { this.observe = () => {}; this.disconnect = () => {}; },
  MutationObserver: function MutationObserver() {
    this.observe = (target) => { assert.ok(target, 'observer needs a real fixture target'); observers.add(this); };
    this.disconnect = () => { observers.delete(this); };
  },
  KeyboardEvent: function KeyboardEvent(type, init) { Object.assign(this, init ?? {}); this.type = type; },
});

vm.runInContext(source, context, { filename: 'client.js' });

assert.ok(captured, 'module must call the module loader');
assert.equal(captured.id, 'dsh-minimal-ui');
assert.equal(typeof captured.factory, 'function');

// Requiring the primitives module must not happen at module scope: the loader table may still be
// wiring when this module is evaluated, and a throw there is what a boot failure looks like.
let requiredAtLoad = false;
const plugin = captured.factory((name) => {
  if (name === 'react') return React;
  requiredAtLoad = true;
  throw new Error(`unexpected module require at load: ${name}`);
});
assert.equal(requiredAtLoad, false, 'factory must not resolve host modules while evaluating');
assert.ok(plugin && typeof plugin.apply === 'function', 'factory must export an apply');

// Only shell services may block activation; theme, inputTriggers and sessions are probed.
assert.equal(Array.from(plugin.inject).join(','), 'slots,locale');

// cordis throws on an undeclared service read, so every optional lookup must go through
// the non-throwing reflect.get helper; a bare ctx.get(...) would abort apply on boot.
assert.ok(source.includes('ctx.reflect.get(name)'), 'probe must use reflect.get');
assert.equal(/ctx\.get\(/.test(source), false, 'aborting ctx.get service read must be gone');
assert.equal(/ctx\.sidebarRightTabs/.test(source), false, 'bare service property read must be gone');
assert.equal(/minimal-ui-beacon/.test(source), false, 'debug beacon must stay out of the UI');

const registered = [];
const disposers = [];
const ctx = {
  effect: (fn) => { const dispose = fn(); if (typeof dispose === 'function') disposers.push(dispose); },
  on: () => () => {},
  reflect: { get: () => undefined },
  locale: { register: () => () => {} },
  slots: {
    entries: () => [],
    inject: (name, cb) => {
      const value = cb();
      registered.push(name);
      return typeof value === 'function' ? value : () => {};
    },
    register: (options) => { registered.push(`${options.name}#${options.id}`); return () => {}; },
  },
};

plugin.apply(ctx);

assert.ok(registered.includes('shell.overlay'), 'overlay style cell must register');
assert.ok(registered.includes('sidebar.footer.action#local-minimal-ui-theme-toggle'), 'theme cell must register');
assert.ok(registered.includes('sidebar.right.tab.guide.actions#local-minimal-ui-guide-fold'), 'fold cell must register');
assert.ok(registered.includes('conversation.input.left#local-minimal-ui-stats'), 'stats cell must register');

// Missing optional services must schedule probes, not throw, and must stay bounded.
assert.ok(timers.length >= 2, 'theme and composer probes should be scheduled');
assert.ok(timers.filter((t) => t.ms === 200).length >= 2, 'probes must use the 200ms retry cadence');

// The new document effects must install without a desktop caption host, then clean up.
assert.equal(styles.size, 1, 'user metadata stylesheet must install during boot');
assert.ok([...styles][0].textContent.includes('question-reply'), 'stylesheet includes question answers');
assert.ok(listeners.get('focusout')?.size, 'caption focus capture must install');
assert.ok(observers.size, 'caption mount observer must install without a caption host');
// The disposers must run cleanly with those services still absent.
for (const dispose of disposers) dispose();
assert.equal(styles.size, 0, 'document styles must not leak after disposal');
assert.equal(observers.size, 0, 'document observers must disconnect after disposal');
assert.ok([...listeners.values()].every((entries) => entries.size === 0), 'document listeners must not leak');
assert.equal(errors.length, 0, 'normal startup must not emit diagnostic errors');
assert.throws(() => plugin.apply({ ...ctx, effect: () => { throw new Error('simulated initialization failure'); } }),
  /simulated initialization failure/);
assert.equal(errors.length, 1, 'initialization failures must remain visible');
assert.match(errors[0], /apply:throw.*simulated initialization failure/);

console.log('Boot guard, optional-service retries, cleanup and error-only diagnostics: passed.');
