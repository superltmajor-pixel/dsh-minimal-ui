// Check package metadata, loader IDs and exported resource paths in the prepared directory.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const manifest = JSON.parse(read('package.json'));
assert.equal(manifest.name, 'dsh-minimal-ui');
assert.equal(manifest.version, '0.10.33');
assert.equal(manifest.private, true, 'npm publication must remain disabled during preparation');
assert.equal(manifest.license, 'MIT');
assert.equal(manifest.engines.dsh, '=0.2.2-rc.1');
assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml');
assert.equal(manifest.dsh.client.platform, 'web');
assert.match(read('cordis.patch.yml'), /name:\s*['"]?dsh-minimal-ui['"]?(?:\s|$)/);
assert.match(read('client.js'), /id:\s*'dsh-minimal-ui'/);
assert.match(read('LICENSE'), /Permission is hereby granted, free of charge/);
for (const locale of ['en', 'zh']) {
  assert.ok(JSON.parse(read(`locale/${locale}.json`)));
  assert.ok(fileURLToPath(import.meta.resolve(`dsh-minimal-ui/locale/${locale}.json`)).endsWith(`${locale}.json`));
}
assert.ok(fileURLToPath(import.meta.resolve('dsh-minimal-ui/client')).endsWith('client.js'));
assert.ok(fileURLToPath(import.meta.resolve('dsh-minimal-ui/icon')).endsWith('icon.svg'));
const host = await import('dsh-minimal-ui');
assert.equal(typeof host.apply, 'function');
console.log('Package metadata, loader names, resources and host export: passed.');
