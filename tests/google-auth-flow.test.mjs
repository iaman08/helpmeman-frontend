import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import ts from 'typescript';

// Execute the actual provider with controlled hooks, SDK events, requests and
// clocks. No real account, network request or CAPTCHA is used.
function harness({ probe = Promise.resolve({ data: { session: null } }) } = {}) {
  const slots = [], effects = [], timers = new Map(), redirects = [], posts = [];
  let cursor = 0, listener, nextTimer = 0;
  const storage = () => { const map = new Map(); return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key), clear: () => map.clear() }; };
  globalThis.localStorage = storage(); globalThis.sessionStorage = storage();
  globalThis.window = { location: { hash: '', search: '', origin: 'https://helpmeman.local', replace: url => redirects.push(url) } };
  const hooks = {
    createContext: () => ({ Provider: 'provider' }),
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useCallback: fn => fn, useMemo: fn => fn(),
    useEffect(fn, deps) { const i = cursor++; const previous = slots[i]; if (!previous || deps.some((dep, j) => dep !== previous.deps[j])) { effects.push(() => { previous?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); } },
  };
  const api = { post: (...args) => new Promise((resolve, reject) => posts.push({ args, resolve, reject })), get: async () => ({}) };
  const sdk = { auth: { getSession: () => probe, onAuthStateChange: fn => { listener = fn; return { data: { subscription: { unsubscribe() {} } } }; }, signInWithOAuth: async () => ({ error: null }) } };
  const filename = new URL('../lib/auth-context.tsx', import.meta.url).pathname;
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
  const instance = new Module(filename);
  instance.require = dep => {
    if (dep === 'react') return hooks;
    if (dep === 'react/jsx-runtime') return { jsx: (_, props) => props.value };
    if (dep === 'next/navigation') return { useRouter: () => ({}) };
    if (dep === './api') return { __esModule: true, default: api, setAuthCookies() {}, clearAuthCookies() {} };
    if (dep === './supabase') return { __esModule: true, default: sdk };
    if (dep === 'swr') return {};
    throw Error(dep);
  };
  globalThis.__authTestClock = { setTimeout: (fn, ms) => { timers.set(++nextTimer, { fn, ms }); return nextTimer; }, clearTimeout: id => timers.delete(id) };
  instance._compile('const {setTimeout, clearTimeout} = globalThis.__authTestClock;\n' + compiled, filename);
  const render = () => { cursor = 0; const value = instance.exports.AuthProvider({ children: null }); effects.splice(0).forEach(fn => fn()); return value; };
  return { render, posts, redirects, timers, emit: (event, session) => listener(event, session), routing: instance.exports.getAuthRedirect,
    tick(ms) { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.fn(); } },
  };
}
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const session = { access_token: 'test-provider-token', refresh_token: 'test-provider-refresh' };

async function start(h) { h.render(); await settle(); await h.render().loginWithGoogle('MENTOR'); h.render(); }

test('Google sign-in started after initial hydration gets its own deadline', async () => {
  const h = harness(); h.render(); h.tick(10_000); await settle();
  await start(h); assert.equal(h.render().googleAuthenticating, true);
  h.tick(25_000); const state = h.render();
  assert.equal(state.googleAuthenticating, false); assert.match(state.googleAuthError, /too long/);
});

test('late backend success after deadline cannot persist or redirect', async () => {
  const h = harness(); await start(h); h.emit('SIGNED_IN', session); h.tick(0);
  assert.equal(h.posts.length, 1); h.tick(25_000);
  assert.equal(h.posts[0].args[2].signal.aborted, true);
  h.posts[0].resolve({ data: { accessToken: 'late', user: { role: 'MENTOR' } } }); await settle();
  assert.equal(localStorage.getItem('helpmeman.accessToken'), null); assert.deepEqual(h.redirects, []);
});

test('backend rejection is visible and preserves mentor intent for recovery', async () => {
  const h = harness(); await start(h); h.emit('SIGNED_IN', session); h.tick(0);
  h.posts[0].reject(Error('API unavailable')); await settle();
  assert.match(h.render().googleAuthError, /could not be completed/);
  assert.equal(localStorage.getItem('helpmeman.onboardingRoleIntent'), 'MENTOR');
});

test('duplicate SDK events sync once and new mentor resumes onboarding', async () => {
  const h = harness(); await start(h);
  localStorage.setItem('helpmeman.loginRedirectIntent', '/mentor');
  h.emit('SIGNED_IN', session); h.emit('INITIAL_SESSION', session); h.tick(0);
  assert.equal(h.posts.length, 1);
  h.posts[0].resolve({ data: { accessToken: session.access_token, user: { role: 'MENTOR' }, mentor: null } }); await settle();
  assert.deepEqual(h.redirects, ['/onboarding?role=mentor']);
  assert.equal(localStorage.getItem('helpmeman.refreshToken'), session.refresh_token);
});

test('a stalled SDK callback is bounded even before any backend request', async () => {
  const h = harness({ probe: new Promise(() => {}) }); window.location.hash = '#access_token=test';
  h.render(); h.render(); h.tick(25_000);
  assert.equal(h.posts.length, 0); assert.match(h.render().googleAuthError, /too long/);
});

test('redirect intents cannot escape the role destination or skip approval', () => {
  const { routing } = harness();
  for (const intent of ['//evil.example', 'https://evil.example', '/dashboard/../../admin', '/mentor', '/signin', '/dashboard\\evil', '/dashboard/..%2f..%2fadmin']) {
    const result = routing('/dashboard', intent);
    assert.ok(result.startsWith('/dashboard'), result);
  }
  assert.equal(routing('/mentor/status', '/mentor'), '/mentor/status');
  assert.equal(routing('/mentor', '/mentor/bookings?tab=upcoming'), '/mentor/bookings?tab=upcoming');
});


test('callback already parsed by SDK still syncs using recent sign-in intent', async () => {
  const h = harness({ probe: Promise.resolve({ data: { session } }) });
  sessionStorage.setItem('helpmeman.oauthInProgress', 'true');
  sessionStorage.setItem('helpmeman.oauthStartedAt', String(Date.now()));
  h.render(); await settle(); h.render();
  assert.equal(h.posts.length, 1);
  h.posts[0].resolve({ data: { accessToken: session.access_token, user: { role: 'STUDENT' } } }); await settle();
  assert.deepEqual(h.redirects, ['/dashboard']);
});

test('expired intent never replays a stored Google session', async () => {
  const h = harness({ probe: Promise.resolve({ data: { session } }) });
  sessionStorage.setItem('helpmeman.oauthInProgress', 'true');
  sessionStorage.setItem('helpmeman.oauthStartedAt', String(Date.now() - 6 * 60_000));
  h.render(); await settle(); h.render();
  assert.equal(h.posts.length, 0); assert.equal(h.render().googleAuthenticating, false);
});
