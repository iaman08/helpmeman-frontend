import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSource, componentHarness, find, findAll, textOf, browser } from './support/component-harness.mjs';
const policy = loadSource('lib/mentor-workflow.ts');
const nameQuestion = { key: 'full_name', text: 'Your name?', type: 'text' };
const state = (overrides = {}) => ({ role: 'MENTOR', status: 'IN_PROGRESS', currentQuestion: 0, totalQuestions: 3, question: nameQuestion, answers: [], ...overrides });
class AxiosError extends Error { constructor(message, response) { super(message); this.response = response; } }
const errorMessage = (err, fallback) => typeof err?.response?.data?.error === 'string' ? err.response.data.error : err instanceof Error ? err.message : fallback;

function onboarding(api, { params = 'role=mentor', mentor = null, dataUser } = {}) {
  const redirects = browser();
  const user = dataUser || { id: 'candidate', role: 'MENTOR', onboardingRole: 'MENTOR', name: 'Test Mentor' };
  const search = new URLSearchParams(params), router = { replace: path => redirects.push(path) };
  const auth = { user, mentor, loading: false, updateUser: data => Object.assign(user, data), refreshUser: async () => {}, setSessionFromToken: async () => user };
  const mocks = { 'next/navigation': { useRouter: () => router, useSearchParams: () => search }, '@/lib/api': { __esModule: true, default: api, extractErrorMessage: errorMessage }, '@/lib/auth-context': { useAuth: () => auth }, axios: { AxiosError } };
  return { ...componentHarness('app/onboarding/page.tsx', mocks, { unwrap: true }), redirects };
}
// Spread keeps methods but not the live tree getter; get the result from flush.
for (const [label, data, expected] of [
  ['new mentor', state(), 'method_choice'],
  ['manual entry', state(), 'name'],
  ['saved interview', state({ currentQuestion: 1 }), 'chat'],
  ['mentee', state({ role: 'MENTEE' }), 'role'],
]) test(`stage policy: ${label}`, () => assert.equal(policy.onboardingStage(data, { linkedIn: false, manual: label === 'manual entry' }), expected));

for (const [label, key, answer] of [['empty name', 'full_name', ' '], ['short name', 'full_name', 'A'], ['overlong name', 'full_name', 'a'.repeat(101)], ['bad email', 'email_address', 'broken'], ['overlong answer', 'scenario', 'a'.repeat(10001)]]) {
  test(`validation rejects ${label}`, () => assert.ok(policy.mentorAnswerError(key, answer)));
}
test('unicode names and valid email answers remain accepted', () => { assert.equal(policy.mentorAnswerError('full_name', 'आरव शर्मा'), null); assert.equal(policy.mentorAnswerError('email_address', 'mentor@example.test'), null); });
test('signup enforces the same password and name limits as the backend', () => { assert.ok(policy.mentorSignupError('A', 'a@example.test', 'Example123')); assert.ok(policy.mentorSignupError('Test Mentor', 'a@example.test', 'lowercase')); assert.equal(policy.mentorSignupError('Test Mentor', 'a@example.test', 'Example123'), null); });

test('failed mentor load retries with mentor intent, including uppercase intents', async () => {
  const calls = []; let fail = true;
  const h = onboarding({ patch: async (...args) => { calls.push(args); if (fail) throw Error('offline'); return { data: state() }; } }, { params: 'role=MENTOR' });
  let tree = await h.flush(); assert.match(textOf(tree), /Retry loading/);
  fail = false; await find(tree, node => node.type === 'button' && textOf(node).includes('Retry loading')).props.onClick();
  await h.flush(); assert.equal(calls.length, 2); assert.equal(calls[1][1].role, 'MENTOR');
});

test('cached completion cannot skip an incomplete server interview', async () => {
  const h = onboarding({ patch: async () => ({ data: state({ currentQuestion: 1, question: { key: 'email_address', text: 'Your email?' } }) }) }, { mentor: { onboardingCompleted: true, approvalStatus: 'APPROVED' } });
  const tree = await h.flush(); assert.equal(h.redirects.length, 0); assert.match(textOf(tree), /Ruth AI onboarding/);
});

test('rapid duplicate answer submission sends only one request and preserves the draft on failure', async () => {
  let reject, posts = 0;
  const h = onboarding({ patch: async () => ({ data: state({ currentQuestion: 1, question: { key: 'email_address', text: 'Your email?' } }) }), post: () => { posts++; return new Promise((_, fail) => { reject = fail; }); }, get: async () => ({ data: state({ currentQuestion: 1, question: { key: 'email_address', text: 'Your email?' } }) }) });
  let tree = await h.flush(); find(tree, node => node.type === 'textarea').props.onChange({ target: { value: 'candidate@example.test' } }); tree = await h.flush();
  const form = find(tree, node => node.type === 'form'); form.props.onSubmit({ preventDefault() {} }); form.props.onSubmit({ preventDefault() {} });
  assert.equal(posts, 1); reject(new AxiosError('invalid', { status: 400, data: { error: 'Please retry' } }));
  tree = await h.flush(); assert.equal(find(tree, node => node.type === 'textarea').props.value, 'candidate@example.test');
});

test('Later can render an incomplete application status instead of redirecting back', async () => {
  const redirects = browser(); const user = { id: 'candidate', role: 'MENTOR' };
  const h = componentHarness('app/mentor/layout.tsx', {
    'next/navigation': { useRouter: () => ({ replace: path => redirects.push(path) }), usePathname: () => '/mentor/status' },
    '@/lib/auth-context': { useAuth: () => ({ user, mentor: null, loading: false, isMentor: true }) },
    '@/lib/api': { __esModule: true, default: { get: async () => ({ data: state() }) } },
    '@/lib/hooks': { useUnreadChatCount: () => ({}) }, '@/lib/socket-context': { useSocket: () => ({ socket: null }) },
  }, { props: { children: 'Application status' } });
  const tree = await h.flush(); assert.equal(redirects.length, 0); assert.equal(tree.props.children, 'Application status');
});

function linkedIn(api, { url = 'http://localhost/onboarding?role=mentor', profile, storedDraft } = {}) {
  browser(url); const user = { id: 'candidate', name: 'Test Mentor' };
  if (storedDraft) localStorage.setItem('helpmeman.mentorDraft:candidate', JSON.stringify({ version: 1, form: storedDraft }));
  return componentHarness('components/mentor/LinkedInOnboarding.tsx', {
    'next/navigation': { useRouter: () => ({ push() {}, replace() {} }) }, '@/lib/api': { __esModule: true, default: api, extractErrorMessage: errorMessage },
    '@/lib/auth-context': { useAuth: () => ({ user, refreshUser: async () => {}, setSessionFromToken: async () => user }) },
  }, { props: { onContinueManual() {}, initialImportedData: profile } });
}
const profile = { name: 'Test Mentor', about: 'A supplied professional bio', headline: 'Researcher' };

test('missing LinkedIn callback profile displays a manual recovery action', async () => {
  const h = linkedIn({ get: async () => ({ data: { connected: false, profile: null } }) }, { url: 'http://localhost/onboarding?linkedin=success' });
  const tree = await h.flush(); assert.match(textOf(tree), /Continue Manually/); assert.match(textOf(tree), /did not return a profile/);
});

test('malformed AI analysis degrades to editable imported facts and valid arrays', async () => {
  const h = linkedIn({ post: async () => ({ data: { suggestedBio: { bad: true }, expertiseAreas: 'not-a-list', completionPercentage: 999 } }) }, { profile });
  const tree = await h.flush(); const analysis = h.exports.normalizeRuthAnalysis({ expertiseAreas: [3, 'Research'], completionPercentage: 999 }, profile);
  assert.deepEqual(analysis.expertiseAreas, ['Research']); assert.equal(analysis.completionPercentage, 100);
  assert.equal(find(tree, node => node.type === 'textarea').props.value, profile.about);
});

test('cancelled LinkedIn callback with a literal percent sign never crashes', async () => {
  const h = linkedIn({}, { url: 'http://localhost/onboarding?linkedinError=oauth_error&message=100%25%20cancelled' });
  assert.match(textOf(await h.flush()), /100% cancelled/);
});

test('partial edited LinkedIn drafts resume without re-running AI or losing incomplete fields', async () => {
  const draft = { displayName: 'Edited Name', bio: '', headline: '', currentRole: '', company: '', location: 'India', categorySlug: 'general-mentorship', expertise: [], mentoringTopics: [], languages: ['English'], pricePerSession: 0, sessionDuration: 30, experienceYears: 0, availabilities: [] };
  const h = linkedIn({}, { storedDraft: draft }); const tree = await h.flush();
  assert.equal(find(tree, node => node.type === 'textarea').props.value, ''); assert.match(textOf(tree), /Edited Name/);
});


test('publishing once stays submitted even when auth callback identities refresh', async () => {
  let published = 0, resolvePublish;
  const h = linkedIn({ post: async (url) => {
    if (url === '/linkedin/publish') { published++; return new Promise(resolve => { resolvePublish = resolve; }); }
    return { data: { suggestedBio: profile.about } };
  } }, { profile });
  let tree = await h.flush();
  find(tree, node => node.props?.id === 'btn-continue-missing-info').props.onClick(); tree = await h.flush();
  find(tree, node => node.props?.id === 'btn-continue-preview').props.onClick(); tree = await h.flush();
  const button = find(tree, node => node.props?.id === 'btn-publish-mentor-profile');
  button.props.onClick(); button.props.onClick(); assert.equal(published, 1);
  resolvePublish({ data: { success: true } }); tree = await h.flush();
  assert.match(textOf(tree), /Application Submitted/); assert.doesNotMatch(textOf(tree), /Review your mentor profile/);
});


test('existing-account email verification uses verification rather than signup and returns to CAPTCHA sign-in', async () => {
  browser('http://localhost/signin'); const calls = [];
  const Captcha = () => null, OTP = () => null;
  const h = componentHarness('app/signin/page.tsx', {
    'next/navigation': { useRouter: () => ({ push() {}, prefetch() {} }) },
    '@/lib/auth-context': { useAuth: () => ({ loading: false, user: null, login: async () => { throw new AxiosError('Verify email', { status: 403, data: { requiresVerification: true, email: 'mentor@example.test' } }); } }) },
    '@/lib/api': { __esModule: true, default: { post: async (...args) => { calls.push(args); return { data: {} }; } }, extractErrorMessage: errorMessage },
    '@/components/CaptchaWidget': { __esModule: true, default: Captcha }, '@/components/OTPInput': { __esModule: true, default: OTP }, axios: { AxiosError },
  });
  let tree = await h.flush();
  find(tree, node => node.type === 'input' && node.props.type === 'email').props.onChange({ target: { value: 'mentor@example.test' } });
  find(tree, node => node.type === 'input' && node.props.type === 'password').props.onChange({ target: { value: 'Example123' } });
  find(tree, node => node.type === Captcha).props.onChange({ captchaId: 'mock', captchaAnswer: 'TEST' }); tree = await h.flush();
  await find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} }); tree = await h.flush();
  assert.equal(calls[0][0], '/auth/resend-otp'); find(tree, node => node.type === OTP).props.onChange('123456'); tree = await h.flush();
  await find(tree, node => node.type === 'form').props.onSubmit({ preventDefault() {} }); tree = await h.flush();
  assert.equal(calls[1][0], '/auth/verify-email-otp'); assert.ok(find(tree, node => node.type === Captcha)); assert.match(textOf(tree), /Your email is verified/); h.unmount();
});
