import type { PixelImage, ProcessingStep } from '../processing/types';

export const challenges = [
  {
    id: 'colors',
    number: '01',
    title: 'Remove the Colors',
    sample: 'color-study',
    concept: 'Color → intensity',
    goal: 'Keep the shapes and brightness, but make every color disappear.',
    hint: 'Look for a step that keeps light and dark information while leaving color behind.',
    feedback:
      'Each pixel now has equal red, green, and blue values. You changed color information into intensity.',
  },
  {
    id: 'object',
    number: '02',
    title: 'Separate the Object',
    sample: 'contrast',
    concept: 'Object → background',
    goal: 'Make the mug and its background belong to two different groups: black and white.',
    hint: 'Try separating light and dark. Move the dividing line until you can recognize the mug.',
    feedback:
      'Your result contains both black and white regions. A threshold can help separate an object from its background: segmentation.',
  },
  {
    id: 'boundary',
    number: '03',
    title: 'Find the Boundary',
    sample: 'contrast',
    concept: 'Image → boundaries',
    goal: 'Make the outline of the mug visible while flat areas become dark.',
    hint: 'Look for a step that reveals changes in brightness between neighboring pixels.',
    feedback:
      'Strong brightness changes became bright lines. The computer extracted clues about the object’s boundaries.',
  },
  {
    id: 'clean',
    number: '04',
    title: 'Clean the Edges',
    sample: 'texture',
    concept: 'Prepare → extract',
    goal: 'Find the mug’s boundary and reduce the distracting small details around it.',
    hint: 'Try removing color, then softening the image before finding edges. Compare different soften amounts.',
    feedback:
      'You prepared the image before extracting its boundaries. Compare your result with edges alone to see whether the noise is reduced.',
  },
] as const;
export type ChallengeId = (typeof challenges)[number]['id'];
export function evaluateChallenge(
  id: ChallengeId,
  steps: ProcessingStep[],
  output: PixelImage,
): boolean {
  const enabled = steps.filter((s) => s.enabled);
  const has = (type: ProcessingStep['type']) => enabled.some((s) => s.type === type);
  let min = 255,
    max = 0,
    gray = true,
    binary = true;
  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i],
      g = output.data[i + 1],
      b = output.data[i + 2];
    min = Math.min(min, r);
    max = Math.max(max, r);
    gray &&= r === g && g === b;
    binary &&= (r === 0 || r === 255) && r === g && g === b;
  }
  if (id === 'colors') return has('grayscale') && gray;
  if (id === 'object') return has('threshold') && binary && min === 0 && max === 255;
  if (id === 'boundary') return has('edges') && max > 20 && min < 10;
  const blur = enabled.findIndex((s) => s.type === 'blur');
  const edges = enabled.findIndex((s) => s.type === 'edges');
  return has('grayscale') && blur >= 0 && edges > blur && max > 20 && min < 10;
}
