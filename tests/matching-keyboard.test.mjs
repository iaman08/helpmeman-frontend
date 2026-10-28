import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const filename = new URL('../lib/matching-keyboard.ts', import.meta.url);
const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const sourceModule = { exports: {} };
new Function('module', 'exports', 'require', outputText)(sourceModule, sourceModule.exports, createRequire(import.meta.url));
const { getMatchKeyboardAction } = sourceModule.exports;

for (const [key, action] of [['ArrowLeft', 'skip'], ['ArrowRight', 'interested'], ['ArrowUp', 'priority'], ['Enter', 'expand']]) {
  test(`${key} dispatches ${action}`, () => assert.equal(getMatchKeyboardAction({ key }), action));
  test(`${key} leaves interactive controls alone`, () => assert.equal(getMatchKeyboardAction({ key, targetIsInteractive: true }), null));
}
for (const flag of ['busy', 'repeat', 'isComposing', 'defaultPrevented', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
  test(`ignores ArrowRight when ${flag}`, () => assert.equal(getMatchKeyboardAction({ key: 'ArrowRight', [flag]: true }), null));
}
test('undo supports native control and command modifiers outside editors', () => {
  assert.equal(getMatchKeyboardAction({ key: 'z', ctrlKey: true }), 'undo');
  assert.equal(getMatchKeyboardAction({ key: 'Z', metaKey: true }), 'undo');
  assert.equal(getMatchKeyboardAction({ key: 'z', ctrlKey: true, targetIsInteractive: true }), null);
  assert.equal(getMatchKeyboardAction({ key: 'z', metaKey: true, shiftKey: true }), null);
});
test('unassigned keys and bare z preserve native behavior', () => {
  for (const key of ['z', 'Z', 'ArrowDown', 'Escape', 'Tab', ' ']) assert.equal(getMatchKeyboardAction({ key }), null);
});
