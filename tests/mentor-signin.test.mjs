import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import ts from 'typescript';

const walk = (node, predicate) => {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const found = walk(child, predicate); if (found) return found; }
  return null;
};
function formHarness(result = '/mentor', failure = null, page = 'apply-mentor') {
  let cursor = 0; const states = [], calls = [];
  let user = null;
  const Captcha = () => null, TwoFactor = () => null;
  const filename = new URL(`../app/${page}/page.tsx`, import.meta.url).pathname;
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const instance = new Module(filename);
  instance.require = dep => {
    if (dep === 'react') return { useEffect() {}, useRef(initial) { const i = cursor++; return states[i] ??= { current: initial }; }, useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => states[i] = typeof value === 'function' ? value(states[i]) : value]; } };
    if (dep === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (dep === 'next/navigation') return { useRouter: () => ({}) };
    if (dep === '@/lib/auth-context') return { useAuth: () => ({ loading: false, user, login: async (...args) => { calls.push(args); if (failure) throw failure; if (result?.requires2FASetup) user = { role: "ADMIN" }; return result; } }) };
    if (dep === '@/components/CaptchaWidget') return { __esModule: true, default: Captcha };
    if (dep === '@/components/TwoFactorModal') return { __esModule: true, default: TwoFactor };
    if (dep === 'axios') return { AxiosError: class extends Error {} };
    return {};
  };
  instance._compile(compiled, filename);
  const render = () => { cursor = 0; return instance.exports.default(); };
  if (page === 'apply-mentor') walk(render(), node => node.type === 'button' && node.props.children === 'Sign in').props.onClick();
  let tree = render();
  walk(tree, node => node.type === 'input' && node.props.type === 'email').props.onChange({ target: { value: 'candidate@example.test' } });
  walk(tree, node => node.type === 'input' && node.props.type === 'password').props.onChange({ target: { value: 'mock-password-only' } });
  return { calls, render, captcha: () => walk(render(), node => node.type === Captcha), twoFactor: () => walk(render(), node => node.type === TwoFactor), submit: () => walk(render(), node => node.type === 'form').props.onSubmit({ preventDefault() {} }) };
}

test('mentor password sign-in blocks submission without a verification challenge', async () => {
  const h = formHarness(); await h.submit(); assert.equal(h.calls.length, 0);
});
test('mentor password sign-in sends the rendered challenge payload', async () => {
  const h = formHarness();
  // Synthetic component payload, not a real CAPTCHA or verification attempt.
  h.captcha().props.onChange({ captchaId: 'mock-id', captchaAnswer: 'TEST' });
  await h.submit(); assert.deepEqual(h.calls[0], ['candidate@example.test', 'mock-password-only', { captchaId: 'mock-id', captchaAnswer: 'TEST' }]);
});
test('failed mentor sign-in requests a fresh challenge', async () => {
  const h = formHarness('/mentor', Error('rejected'));
  h.captcha().props.onChange({ captchaId: 'mock-id', captchaAnswer: 'TEST' });
  await h.submit(); assert.equal(h.captcha().props.refreshTrigger, 1);
});
test('mentor sign-in opens two-factor verification instead of sending user elsewhere', async () => {
  const h = formHarness({ requires2FA: true, tempToken: 'mock-2fa-token' });
  h.captcha().props.onChange({ captchaId: 'mock-id', captchaAnswer: 'TEST' });
  await h.submit(); assert.equal(h.twoFactor().props.isOpen, true);
  assert.equal(h.twoFactor().props.mode, 'verify'); assert.equal(h.twoFactor().props.tempToken, 'mock-2fa-token');
});


test('session persistence during mandatory two-factor setup keeps the modal mounted', async () => {
  const h = formHarness({ requires2FASetup: true, tempToken: 'mock-setup-token' });
  h.captcha().props.onChange({ captchaId: 'mock-id', captchaAnswer: 'TEST' });
  await h.submit(); assert.equal(h.twoFactor()?.props.isOpen, true);
  assert.equal(h.twoFactor().props.mode, 'setup');
});


test('regular sign-in keeps mandatory setup visible after session persistence', async () => {
  const h = formHarness({ requires2FASetup: true, tempToken: 'mock-setup-token' }, null, 'signin');
  h.captcha().props.onChange({ captchaId: 'mock-id', captchaAnswer: 'TEST' });
  await h.submit(); assert.equal(h.twoFactor()?.props.isOpen, true);
  assert.equal(h.twoFactor().props.isMandatory, true);
});
