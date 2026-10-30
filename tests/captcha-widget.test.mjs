import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import ts from 'typescript';

function widgetHarness() {
  const slots = [], effects = [], requests = [], changes = [];
  let cursor = 0;
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
    useId: () => 'verification-test',
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((dep, j) => slots[i].deps[j] !== dep)) slots[i] = { fn, deps }; return slots[i].fn; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((dep, j) => slots[i][j] !== dep)) { slots[i] = deps; effects.push(fn); } },
  };
  const filename = new URL('../components/CaptchaWidget.tsx', import.meta.url).pathname;
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const instance = new Module(filename);
  instance.require = dep => {
    if (dep === 'react') return hooks;
    if (dep === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (dep === 'lucide-react') return {};
    if (dep === '@/lib/api') return { __esModule: true, extractErrorMessage: (_, fallback) => fallback, default: { get: () => new Promise((resolve, reject) => requests.push({ resolve, reject })) } };
    throw Error(dep);
  };
  instance._compile(compiled, filename);
  const onChange = value => changes.push(value);
  const render = (props = {}) => { cursor = 0; const tree = instance.exports.default({ onChange, ...props }); effects.splice(0).forEach(fn => fn()); return tree; };
  return { render, requests, changes };
}
function find(tree, predicate) {
  if (!tree || typeof tree !== 'object') return null;
  if (predicate(tree)) return tree;
  for (const child of [tree.props?.children].flat(Infinity)) { const result = find(child, predicate); if (result) return result; }
  return null;
}
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
const challenge = { captchaId: 'mock-challenge', svg: '<svg aria-label="mock challenge" />', expiresAt: Date.now() + 10000 };

test('loaded verification challenge renders a labelled enabled input', async () => {
  const h = widgetHarness(); h.render(); h.requests[0].resolve({ data: challenge }); await settle();
  const tree = h.render(); const input = find(tree, node => node.type === 'input');
  assert.equal(input.props.disabled, false);
  assert.equal(find(tree, node => node.type === 'label').props.htmlFor, input.props.id);
  assert.deepEqual(h.changes.at(-1), { captchaId: challenge.captchaId, captchaAnswer: '', notRequired: false });
});

test('missing endpoint stays visible with retry and never disables verification', async () => {
  const h = widgetHarness(); h.render();
  const log = console.error; console.error = () => {};
  try { h.requests[0].reject({ response: { status: 404 } }); await settle(); } finally { console.error = log; }
  const tree = h.render(); assert.ok(tree);
  assert.ok(find(tree, node => node.props?.role === 'alert'));
  assert.equal(find(tree, node => node.type === 'input').props.disabled, true);
  assert.equal(h.changes.some(change => change.notRequired === true), false);
});

test('refresh clears old challenge immediately and failed refresh cannot reuse it', async () => {
  const h = widgetHarness(); h.render(); h.requests[0].resolve({ data: challenge }); await settle(); h.render();
  h.render({ refreshTrigger: 1 });
  assert.deepEqual(h.changes.at(-1), { captchaId: '', captchaAnswer: '', notRequired: false });
  const log = console.error; console.error = () => {};
  try { h.requests[1].reject(Error('offline')); await settle(); } finally { console.error = log; }
  assert.equal(find(h.render({ refreshTrigger: 1 }), node => node.type === 'input').props.disabled, true);
});


test('a nonzero initial refresh trigger starts only one request', () => {
  const h = widgetHarness(); h.render({ refreshTrigger: 2 });
  assert.equal(h.requests.length, 1);
});

test('an older response cannot overwrite the most recent challenge', async () => {
  const h = widgetHarness(); h.render(); h.render({ refreshTrigger: 1 });
  h.requests[1].resolve({ data: { ...challenge, captchaId: 'newest-id' } }); await settle();
  h.requests[0].resolve({ data: challenge }); await settle();
  assert.equal(h.changes.at(-1).captchaId, 'newest-id');
});
