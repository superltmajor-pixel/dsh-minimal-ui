// Exercise task-panel ownership and dismiss behaviour with a small React stand-in.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');
assert.ok(source.includes('[data-composer-seat]:has([data-minimalui-todo-owner]) [data-testid="todo-panel"]:not(.minimalui-todo-root)'),
  'the host panel must only be hidden when the replacement owns the same composer');
assert.ok(!source.includes('\n[data-testid="todo-panel"]:not(.minimalui-todo-root)'),
  'the host panel must not be hidden unconditionally');

const start = source.indexOf('    // Reuses the host panel classes');
const end = source.indexOf('    // The host has no slot inside', start);
assert.ok(start >= 0 && end > start, 'task-panel component must be present');

let hookIndex = 0;
const state = [];
const React = {
  createElement(type, props, ...children) { return { type, props: props ?? {}, children }; },
  useState(initial) {
    const index = hookIndex++;
    if (!(index in state)) state[index] = initial;
    return [state[index], (next) => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
  },
};
const TodoPanelWithDismiss = vm.runInNewContext(source.slice(start, end) + '\nTodoPanelWithDismiss', { React });
function render(todos) {
  hookIndex = 0;
  return TodoPanelWithDismiss({ useProjection: () => todos, t: (key) => key });
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean) ?? null;
  if (predicate(node)) return node;
  return find(node.children, predicate);
}

const task = [{ content: 'Write tests', status: 'pending' }];
const open = render(task);
assert.equal(open.type, 'section');
assert.equal(open.props['data-minimalui-todo-owner'], '');
const close = find(open, (node) => node.props?.className === 'minimalui-todo-close');
assert.ok(close, 'the replacement must provide a dismiss button');
close.props.onClick();
const dismissed = render(task);
assert.equal(dismissed.type, 'span');
assert.equal(dismissed.props.hidden, true);
assert.equal(dismissed.props['data-minimalui-todo-owner'], '', 'dismissal must keep the host panel hidden');
assert.equal(render([{ ...task[0], status: 'completed' }]).type, 'span', 'progress does not reopen a dismissed list');
assert.equal(render([{ content: 'A new task', status: 'pending' }]).type, 'section', 'a new list reopens');
assert.equal(render([]), null, 'no tasks must not take ownership of the host panel');

console.log('Task-panel ownership, dismissal, progress and new-list behaviour: passed.');
