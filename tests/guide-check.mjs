// Checks third-party guide folding and graceful fallback when host menu rows are unavailable.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');

// 1) Static wiring: the cell, its slot and the service probe must all be present.
assert.ok(source.includes("id: 'local-minimal-ui-guide-fold'"), 'guide fold cell id missing');
assert.ok(source.includes("ctx.slots.inject('sidebar.right.tab.guide.actions'"), 'guide actions slot missing');
assert.ok(source.includes("peekService(ctx, 'sidebarRightTabs')"), 'service probe missing');
assert.ok(source.includes("provider.startsWith('@deepseek-ai/')"), 'provider rule missing');
assert.ok(/\.p2k40q_moreMenu\s*\{[^}]*max-height:\s*min\(62vh, 420px\)/.test(source), 'menu max-height missing');
assert.ok(/\.p2k40q_moreMenu\s*\{[^}]*overflow-y:\s*auto/.test(source), 'menu overflow missing');
assert.ok(/\.p2k40q_moreMenu\s*\{[^}]*overscroll-behavior:\s*contain/.test(source), 'menu overscroll missing');

// 2) Behaviour: slice the fold block out of the real file and drive it.
const start = source.indexOf('    // Guide fold:');
const end = source.indexOf('    function MinimalUI() {');
assert.ok(start > 0 && end > start, 'fold block not found');
const block = source.slice(start, end);

const removed = [];
const appended = [];
const head = {
  appendChild(node) {
    appended.push(node);
    return node;
  },
};
const document = {
  createElement(tag) {
    return {
      tag,
      dataset: {},
      textContent: '',
      remove() {
        removed.push(this);
      },
    };
  },
  head,
};

function FakeMenuItem(props) {
  this.props = props;
}
FakeMenuItem.displayName = 'MenuItemButton';
const hostIcons = { MenuItemButton: FakeMenuItem };

const React = {
  Fragment: 'fragment',
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children };
  },
};

// The slice below starts at the fold block, so the lazy host-icon accessor it now calls
// is supplied directly; a missing accessor would be a test-harness gap, not plugin behaviour.
const context = vm.createContext({ document, hostIcons, React, console, ensureHostIcons: () => hostIcons });
vm.runInContext(`${block}\nthis.api = { refreshFoldedKinds, FoldedGuideRows, foldedKinds };`, context);
const { refreshFoldedKinds, FoldedGuideRows, foldedKinds } = context.api;

const registry = {
  guide: () => [
    { kind: 'files', providerId: '@deepseek-ai/dsh-client-ui-sidebar-right' },
    // better-sidebar re-registers the files card under a third-party id: it must still stay.
    { kind: 'files', providerId: 'dsh-better-sidebar:files' },
    { kind: 'terminal', providerId: '@deepseek-ai/dsh-client-ui-sidebar-terminal' },
    { kind: 'context', providerId: 'dsh-context@0.82.0' },
    { kind: 'memory', providerId: 'dsh-mnemon@0.5.41' },
  ],
};

refreshFoldedKinds(registry);
assert.deepEqual([...foldedKinds].sort(), ['context', 'memory'], 'shipped kinds (and a third-party files takeover) must stay on the page');
assert.equal(appended.length, 1, 'exactly one style tag');
const style = appended[0];
assert.equal(style.tag, 'style');
assert.ok(style.dataset.minimalUiGuideFold === '', 'style tag marker missing');
assert.ok(style.textContent.includes('[data-sidebar-right-guide-entry="context"]'), 'context rule missing');
assert.ok(style.textContent.includes('[data-sidebar-right-guide-entry="memory"]'), 'memory rule missing');
assert.ok(!style.textContent.includes('data-sidebar-right-guide-entry="files"'), 'shipped rule leaked in');
assert.ok(style.textContent.includes('display: none !important'), 'cell must be hidden');
assert.ok(!style.textContent.includes('.p2k40q_entryCell:has') || style.textContent.startsWith('.p2k40q_entryCell:has'), 'selector shape changed');

// Unchanged registry: no second style tag, no rewrite.
const before = style.textContent;
refreshFoldedKinds(registry);
assert.equal(appended.length, 1, 'unchanged registry must not add a style tag');
assert.equal(style.textContent, before, 'unchanged registry must not rewrite the rules');

// Every kind shipped: the tag empties instead of leaving stale rules behind.
refreshFoldedKinds({ guide: () => [{ kind: 'files', providerId: '@deepseek-ai/dsh-client-ui-sidebar-right' }] });
assert.equal(foldedKinds.size, 0, 'shipped-only registry must fold nothing');
assert.equal(style.textContent, '', 'shipped-only registry must clear the rules');
refreshFoldedKinds(registry);

// 3) Menu rows: folded entries only, in registry order, opening through the host action.
const opened = [];
const dismissed = [];
const menuEntries = [
  { id: 'files:main', label: '文件' },
  { id: 'context:main', label: '上下文' },
  { id: 'memory:main', label: '记忆系统' },
];
const tree = FoldedGuideRows({
  entries: menuEntries,
  onOpen: (id) => opened.push(id),
  onDismiss: () => dismissed.push(true),
});
assert.ok(tree && tree.type === 'fragment', 'rows must render a fragment');
// createElement receives one array child, so the rows live inside it.
const rows = tree.children[0];
assert.equal(rows.length, 2, 'only folded entries become rows');
assert.deepEqual(rows.map((row) => row.props.key), ['context:main', 'memory:main'], 'order drifted');
assert.equal(rows[0].type, FakeMenuItem, 'rows must use the host menu item');
assert.deepEqual(rows[0].children, ['上下文'], 'row label missing');
rows[1].props.onSelect();
assert.deepEqual(dismissed, [true], 'menu must close before navigating');
assert.deepEqual(opened, ['memory:main'], 'row must open its own page');

// Nothing folded, or no host menu item: render nothing rather than an empty menu block.
assert.equal(FoldedGuideRows({ entries: menuEntries })?.['children'] !== undefined, true, 'sanity');
refreshFoldedKinds({ guide: () => [{ kind: 'files', providerId: '@deepseek-ai/dsh-client-ui-sidebar-right' }] });
assert.equal(FoldedGuideRows({ entries: menuEntries, onOpen: () => {}, onDismiss: () => {} }), null, 'no folds must render null');
// If the host component disappears after folding, clear existing styles so the
// original cards remain accessible. Also check an absent component on first refresh.
refreshFoldedKinds(registry);
assert.equal(foldedKinds.size, 2, 'sanity: third-party cards are folded while rows exist');
hostIcons.MenuItemButton = undefined;
refreshFoldedKinds(registry);
assert.equal(foldedKinds.size, 0, 'missing host row must disable folding');
assert.equal(style.textContent, '', 'missing host row must restore existing original cards');
assert.equal(FoldedGuideRows({ entries: menuEntries, onOpen: () => {}, onDismiss: () => {} }), null, 'missing host row must render null');
const noMenuContext = vm.createContext({ document, React, console, ensureHostIcons: () => null });
vm.runInContext(`${block}\nthis.api = { refreshFoldedKinds, foldedKinds };`, noMenuContext);
noMenuContext.api.refreshFoldedKinds(registry);
assert.equal(noMenuContext.api.foldedKinds.size, 0, 'a missing host row at startup must never fold cards');
hostIcons.MenuItemButton = FakeMenuItem;
refreshFoldedKinds(registry);
assert.equal(foldedKinds.size, 2, 'folding can resume when a host menu row is available');

console.log('Guide folding, menu rows, open action and missing-host fallback: passed.');
