import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSource, browser } from './support/component-harness.mjs';
function client() {
  browser('http://localhost/'); window.location.hostname = 'localhost';
  let request, reject; const posts = [];
  const axios = { create: () => ({ interceptors: { request: { use: fn => { request = fn; } }, response: { use: (_, fn) => { reject = fn; } } } }), post: (...args) => { posts.push(args); throw Error('No refresh should run'); } };
  loadSource('lib/api.ts', { axios: { __esModule: true, default: axios } });
  return { request, reject, posts };
}
test('an explicit callback token is never overwritten by a previous account token', () => {
  const h = client(); localStorage.setItem('helpmeman.accessToken', 'previous-token');
  const result = h.request({ headers: { Authorization: 'Bearer callback-token' } });
  assert.equal(result.headers.Authorization, 'Bearer callback-token');
});
test('normal authenticated requests still attach the current token', () => {
  const h = client(); localStorage.setItem('helpmeman.accessToken', 'current-token');
  assert.equal(h.request({ headers: {} }).headers.Authorization, 'Bearer current-token');
});
test('an invalid callback session is rejected without refreshing or clearing the previous session', async () => {
  const h = client(); localStorage.setItem('helpmeman.accessToken', 'previous-token');
  const error = { config: { url: '/users/me', skipAuthRefresh: true }, response: { status: 401 } };
  await assert.rejects(h.reject(error), value => value === error);
  assert.equal(h.posts.length, 0); assert.equal(localStorage.getItem('helpmeman.accessToken'), 'previous-token');
});
