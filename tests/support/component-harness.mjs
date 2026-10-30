import fs from 'node:fs';
import Module from 'node:module';
import ts from 'typescript';

export function loadSource(relative, mocks = {}, cache = new Map()) {
  const filename = new URL(`../../${relative}`, import.meta.url).pathname;
  if (cache.has(filename)) return cache.get(filename).exports;
  const instance = new Module(filename); cache.set(filename, instance);
  instance.require = dep => {
    if (Object.hasOwn(mocks, dep)) return mocks[dep];
    if (dep === '@/lib/mentor-workflow') return loadSource('lib/mentor-workflow.ts', mocks, cache);
    return {};
  };
  instance._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
  return instance.exports;
}

export function componentHarness(relative, mocks, { props = {}, unwrap = false } = {}) {
  const slots = [], effects = [], cleanups = [];
  let cursor = 0, dirty = false, tree;
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], value => { const next = typeof value === 'function' ? value(slots[i]) : value; if (!Object.is(next, slots[i])) { slots[i] = next; dirty = true; } }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j]))) slots[i] = { value: fn, deps }; return slots[i].value; },
    useMemo(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j]))) slots[i] = { value: fn(), deps }; return slots[i].value; },
    useEffect(fn, deps) { const i = cursor++; const old = slots[i]; if (!old || !deps || deps.some((dep, j) => !Object.is(dep, old.deps?.[j]))) { slots[i] = { deps }; effects.push(() => { old?.cleanup?.(); const cleanup = fn(); slots[i].cleanup = cleanup; if (cleanup) cleanups.push(cleanup); }); } },
    Suspense: 'suspense',
  };
  const jsx = (type, props) => ({ type, props });
  const loaded = loadSource(relative, { ...mocks, react: hooks, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'motion/react': { motion: new Proxy({}, { get: (_, tag) => tag }), AnimatePresence: 'animate-presence' } });
  const Component = unwrap ? loaded.default().props.children.type : loaded.default;
  function render() { cursor = 0; dirty = false; tree = Component(props); effects.splice(0).forEach(fn => fn()); return tree; }
  async function flush() { for (let i = 0; i < 30; i++) { if (!tree || dirty) render(); await Promise.resolve(); } if (dirty) render(); return tree; }
  return { render, flush, get tree() { return tree; }, exports: loaded, unmount() { cleanups.splice(0).forEach(fn => fn()); } };
}

export function findAll(tree, predicate, found = []) {
  if (!tree || typeof tree !== 'object') return found;
  if (predicate(tree)) found.push(tree);
  for (const child of [tree.props?.children].flat(Infinity)) findAll(child, predicate, found);
  return found;
}
export const find = (tree, predicate) => findAll(tree, predicate)[0];
export function textOf(tree) { if (typeof tree === 'string' || typeof tree === 'number') return String(tree); if (!tree || typeof tree !== 'object') return ''; return [tree.props?.children].flat(Infinity).map(textOf).join(' '); }
export const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key), clear: () => values.clear() }; };
export function browser(url = 'http://localhost/onboarding?role=mentor') {
  const location = new URL(url);
  globalThis.localStorage = storage(); globalThis.sessionStorage = storage();
  const redirects = [];
  globalThis.window = { location: { href: location.href, search: location.search, hash: location.hash, replace: value => redirects.push(value) },
    history: { replaceState: (_, __, next) => { window.location.href = next; } }, setInterval: () => 1, clearInterval() {}, setTimeout: () => 1, addEventListener() {}, removeEventListener() {} };
  globalThis.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  return redirects;
}
