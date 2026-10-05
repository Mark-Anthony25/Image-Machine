import type { PixelImage, ProcessingStep } from '../processing/types';

export const challenges = [
  {
    id: 'colors',
    number: '01',
    title: 'Make it gray',
    sample: 'color-study',
    concept: 'Colors and brightness',
    goal: 'Keep the shapes and brightness, but make every color disappear.',
    hint: 'Look for a step that keeps light and dark information while leaving color behind.',
    feedback: 'You kept the light and dark areas and removed the colors.',
  },
  {
    id: 'object',
    number: '02',
    title: 'Separate the mug',
    sample: 'contrast',
    concept: 'Object and background',
    goal: 'Make the mug black and its background white, or the other way around.',
    hint: 'Try separating light and dark. Move the dividing line until you can recognize the mug.',
    feedback:
      'Your image now has black and white areas. Can you see the mug apart from its background?',
  },
  {
    id: 'boundary',
    number: '03',
    title: 'Trace the outline',
    sample: 'contrast',
    concept: 'Shapes and outlines',
    goal: 'Show the mug’s outline as bright lines on a dark background.',
    hint: 'Look for a step that shows outlines.',
    feedback: 'Big changes in brightness became bright lines that help show the mug’s outline.',
  },
  {
    id: 'clean',
    number: '04',
    title: 'Clearer outlines',
    sample: 'texture',
    concept: 'Small details and outlines',
    goal: 'Show the mug’s outline with fewer distracting lines around it.',
    hint: 'Try removing color, then softening the image before finding edges. Compare different softness settings.',
    feedback:
      'You softened the image before finding its outlines. Compare it with Find edges alone: are there fewer distracting lines?',
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
