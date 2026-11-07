import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../client.js', import.meta.url), 'utf8');
const start = source.indexOf('    function metricReadings(');
const end = source.indexOf('    function StatIcon(', start);
assert(start >= 0 && end > start);
const metric = vm.runInNewContext(source.slice(start, end) + '\nmetricReadings');
assert.equal(metric().speed, null);
assert.equal(metric().cache, null);
assert.equal(metric().context, null);
const measured = metric({ decodeTokens: 120, decodeMs: 2000 }, {
  uncachedInputTokens: 20, cacheReadTokens: 70, cacheWriteTokens: 10,
}, { projectedTokens: 85, pressureTokens: 90, contextWindow: 100 });
assert.equal(measured.speed, 60);
assert.equal(measured.input, 100);
assert.equal(measured.cache, '70%');
assert.equal(measured.context, 85);
assert.equal(metric(null, { uncachedInputTokens: 1, cacheReadTokens: 999, cacheWriteTokens: 0 }).cache, '99.9%');
assert.equal(metric(null, { uncachedInputTokens: 0, cacheReadTokens: 999, cacheWriteTokens: 0 }).cache, '100%');
assert.equal(metric(null, { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }).cache, null);
assert.equal(metric(null, null, { pressureTokens: 12, contextWindow: 100 }).context, 12);
assert.equal(metric(null, null, { projectedTokens: 0, pressureTokens: 12, contextWindow: 100 }).context, 0);
assert.equal(metric(null, null, { projectedTokens: 100, contextWindow: 0 }).context, null);
assert.equal(metric({ decodeTokens: 1, decodeMs: 0 }).speed, null);
const dictStart = source.indexOf('    const dictionaries = ');
const dictEnd = source.indexOf('    // Same disjoint', dictStart);
const dictionaries = vm.runInNewContext(source.slice(dictStart, dictEnd) + '\ndictionaries');
assert.deepEqual(Object.keys(dictionaries).sort(), ['en', 'zh']);
assert.deepEqual(Object.keys(dictionaries.en).sort(), Object.keys(dictionaries.zh).sort());
for (const file of ['package.json', 'locale/en.json', 'locale/zh.json']) {
  JSON.parse(fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8'));
}
console.log('Metrics edge cases, locale key parity and package JSON: passed.');
