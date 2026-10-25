import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the actual exported routing policy without mounting AuthProvider or
// creating a Supabase session. JSX/hooks are not executed by these tests.
const filename = path.join(dirname, '../lib/auth-context.tsx');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;
const instance = new Module(filename);
instance.filename = filename;
instance.require = dependency => {
  if (dependency === 'react') return { createContext: () => ({}) };
  if (['react/jsx-runtime', 'next/navigation', './api', 'swr', './supabase'].includes(dependency)) return {};
  throw new Error(`Unexpected dependency: ${dependency}`);
};
instance._compile(compiled, filename);
const { getLoginDest } = instance.exports;

for (const [label, user, mentor, expected] of [
  ['new mentor', { role: 'MENTOR' }, null, '/onboarding?role=mentor'],
  ['mentor intent', { role: 'STUDENT', onboardingRole: 'MENTOR' }, null, '/onboarding?role=mentor'],
  ['pending incomplete mentor', { role: 'MENTOR' }, { approvalStatus: 'PENDING', onboardingCompleted: false }, '/onboarding?role=mentor'],
  ['approved incomplete mentor', { role: 'MENTOR' }, { approvalStatus: 'APPROVED', onboardingCompleted: false }, '/onboarding?role=mentor'],
  ['submitted pending mentor', { role: 'MENTOR' }, { approvalStatus: 'PENDING', onboardingCompleted: true }, '/mentor/status'],
  ['rejected mentor', { role: 'MENTOR' }, { approvalStatus: 'REJECTED', onboardingCompleted: true }, '/mentor/status'],
  ['approved completed mentor', { role: 'MENTOR' }, { approvalStatus: 'APPROVED', onboardingCompleted: true }, '/mentor'],
  ['student', { role: 'STUDENT' }, null, '/dashboard'],
  ['mentee intent', { onboardingRole: 'MENTEE' }, null, '/dashboard'],
  ['admin', { role: 'ADMIN' }, null, '/admin'],
  ['super admin', { role: 'SUPER_ADMIN' }, null, '/superadmin'],
  ['unselected role', {}, null, '/onboarding'],
]) {
  test(`${label} routes to ${expected}`, () => assert.equal(getLoginDest(user, mentor), expected));
}
