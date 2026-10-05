import { expect, it } from 'vitest';
import { evaluateChallenge, challenges } from '../src/content/challenges';
import type { PixelImage, ProcessingStep } from '../src/processing/types';

const gray: PixelImage = {
  width: 2,
  height: 1,
  data: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]),
};
const step = (type: ProcessingStep['type'], enabled = true): ProcessingStep => ({
  id: type,
  type,
  enabled,
  value: 1,
});
it('provides four beginner challenges with experiment-first hints', () => {
  expect(challenges).toHaveLength(4);
  for (const c of challenges) {
    expect(c.goal.length).toBeGreaterThan(20);
    expect(c.hint.length).toBeGreaterThan(20);
  }
});
it('requires enabled transformations and useful output for discovery feedback', () => {
  expect(evaluateChallenge('colors', [step('grayscale', false)], gray)).toBe(false);
  expect(evaluateChallenge('colors', [step('grayscale')], gray)).toBe(true);
  expect(evaluateChallenge('object', [step('threshold')], gray)).toBe(true);
  const white = { ...gray, data: new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 255]) };
  expect(evaluateChallenge('object', [step('threshold')], white)).toBe(false);
});
it('requires smoothing before edge detection for the clean-edge discovery', () => {
  expect(evaluateChallenge('clean', [step('edges'), step('blur')], gray)).toBe(false);
  expect(evaluateChallenge('clean', [step('grayscale'), step('blur'), step('edges')], gray)).toBe(
    true,
  );
});
