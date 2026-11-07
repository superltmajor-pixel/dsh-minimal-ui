import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');

// The cell must be registered next to the shipped footer cells and the plugin must
// declare the theme service it reads and writes.
// A hard inject of the theme service would keep the whole client boot waiting for it.
assert.match(source, /inject: \['slots', 'locale'\],/, 'plugin only injects the shell services');
assert.match(source, /peekService\(ctx, 'theme'\)/, 'theme service is probed through reflect.get, not injected');
assert.match(source, /peekService\(ctx, 'inputTriggers'\)/, 'composer services are probed too');
assert.match(source, /ctx\.reflect\.get\(name\)/, 'probe uses the non-throwing reflect.get');
assert.match(source, /id: 'local-minimal-ui-theme-toggle', order: 10/, 'own footer cell id');
assert.match(source, /name: 'sidebar\.footer\.action'/, 'registered into the footer action slot');
assert.match(source, /ctx\.on\('theme\/change', adopt\)/, 'reacts to host palette changes');
assert.match(source, /snapshot\?\.active\?\.colorScheme === 'dark'/, 'mirrors the resolved scheme');

// Seat CSS: the seated button leaves the flow so the action row collapses and the icon
// lands on the account row; the fallback keeps it inside the action row.
assert.match(source, /\.minimalui-theme-toggle-overlay \{[^}]*position: absolute;/, 'seated button is out of flow');
assert.match(source, /\.minimalui-theme-toggle-overlay \{[^}]*z-index: 2;/, 'seated button paints over the account row');
assert.match(source, /\.minimalui-theme-toggle-inline \{ margin-left: auto; \}/, 'fallback stays right-aligned in its own row');

const start = source.indexOf('    let resolvedScheme');
const end = source.indexOf('    function MinimalUI()', start);
const slice = source.slice(start, end);

// Minimal React stand-in: createElement records the tree, effects run once, refs are empty
// (no DOM here), so the seat effect exercises its no-DOM guard.
const FakeReact = {
  useState: (value) => [value, () => {}],
  useEffect: (fn) => { fn(); },
  useRef: () => ({ current: null }),
  createElement: (type, props, children) => ({ type, props, children }),
};
const context = { React: FakeReact };
const require = () => ({});
const { ThemeToggle, findAccountRow, seatOffset, setScheme } = vm.runInNewContext(
  slice + '\n({ ThemeToggle, findAccountRow, seatOffset, setScheme: (next) => { resolvedScheme = next; } })',
  { ...context, require },
);

const t = (key) => ({ themeToLight: '切换到亮色', themeToDark: '切换到暗色' })[key];
const toggles = [];
const setTheme = (id) => toggles.push(id);

setScheme('light');
const light = ThemeToggle({ t, setTheme });
assert.equal(light.type, 'button');
assert.equal(light.props.className, 'minimalui-theme-toggle minimalui-theme-toggle-inline',
  'without a measured account row the button stays in the action row');
assert.equal(light.props.title, '切换到暗色');
assert.equal(light.props['aria-label'], '切换到暗色');
assert.equal(light.children.type, 'svg');
assert.equal(light.children.children.length, 1, 'light shows the moon only');
light.props.onClick();
assert.deepEqual(toggles, ['dark']);

setScheme('dark');
const dark = ThemeToggle({ t, setTheme });
assert.equal(dark.props.title, '切换到亮色');
assert.equal(dark.children.children.length, 2, 'dark shows the sun only');
dark.props.onClick();
assert.deepEqual(toggles, ['dark', 'light']);

// A cell rendered without the locale dictionary must still render, unlabelled.
const bare = ThemeToggle({ setTheme });
assert.equal(bare.props.title, undefined);
assert.equal(bare.children.type, 'svg');

// Seat lookup: the slot renderer may wrap the cell, so the walk must climb past a
// wrapper whose next sibling holds nothing and stop at the ancestor that really fronts
// the account row. 42px trigger 4px below the action row centre a 28px button at 11.
const rectNode = (rect) => ({ getBoundingClientRect: () => rect });
const wrapperOf = (parent, children = []) => ({
  parentElement: parent,
  nextElementSibling: null,
  querySelectorAll: () => children,
  firstElementChild: children[0] ?? null,
});
const trigger = { top: 104, height: 42, width: 240 };
const accountRow = {
  parentElement: null,
  nextElementSibling: null,
  querySelectorAll: () => [rectNode(trigger)],
  firstElementChild: rectNode(trigger),
};
const footerActions = {
  parentElement: null,
  nextElementSibling: accountRow,
  querySelectorAll: () => [],
  firstElementChild: null,
};
const wrapper = wrapperOf(footerActions);
const button = { parentElement: wrapper, offsetHeight: 28 };
const match = findAccountRow(button);
assert.equal(match.row, footerActions, 'climbs past the slot wrapper to the action row');
assert.deepEqual(match.trigger, trigger);

// Straight nesting (no wrapper) resolves on the first hop.
assert.equal(findAccountRow({ parentElement: footerActions }).row, footerActions);

// Rail state: a 36px square trigger is not a labelled account row.
const railRow = { ...accountRow, querySelectorAll: () => [rectNode({ top: 0, height: 36, width: 36 })] };
railRow.firstElementChild = rectNode({ top: 0, height: 36, width: 36 });
const railActions = { ...footerActions, nextElementSibling: railRow };
assert.equal(findAccountRow({ parentElement: railActions }), null, 'rail state falls back to the action row');

// No sibling at all, or a dead chain, must not throw and must fall back.
assert.equal(findAccountRow({ parentElement: { parentElement: null, nextElementSibling: null } }), null);
assert.equal(findAccountRow({ parentElement: null }), null);
assert.equal(findAccountRow(null), null);

// A button without a measured height still centres on the 28px default.
assert.equal(seatOffset(trigger, 100, 28), 11);
assert.equal(seatOffset(trigger, 100, 0), 11);
// Larger font scale: a 52px trigger centres the same 28px button at 16.
assert.equal(seatOffset({ top: 104, height: 52 }, 100, 28), 16);


// Host icons: when the primitives module resolves, the button renders the official glyph
// instead of the hand-drawn SVG, still one glyph and still 16px.
const HostIcon = () => ({ type: 'host-icon' });
const host = vm.runInNewContext(
  slice + '\n({ ThemeToggle, setScheme: (next) => { resolvedScheme = next; } })',
  { ...context, require: () => ({ IconLightOutlineMedium: HostIcon, IconDarkOutlineMedium: HostIcon }) },
);
host.setScheme('light');
const hostLight = host.ThemeToggle({ t, setTheme });
assert.equal(hostLight.children.type, HostIcon, 'light renders the official moon glyph');
assert.equal(hostLight.children.props.size, 16, 'official glyph stays at 16px');
host.setScheme('dark');
const hostDark = host.ThemeToggle({ t, setTheme });
assert.equal(hostDark.children.type, HostIcon, 'dark renders the official sun glyph');
assert.equal(hostDark.children.props.size, 16);

console.log('Theme cell registration, wrapper-aware seat lookup, official glyph swap, reverse toggle and label fallback: passed.');
