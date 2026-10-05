import { processOperation } from './operations';
import type { PixelImage, ProcessingStep } from './types';

export function runPipeline(source: PixelImage, steps: ProcessingStep[]): PixelImage[] {
  const frames = [source];
  for (const step of steps) {
    const input = frames[frames.length - 1];
    frames.push(step.enabled ? processOperation(input, step.type, step.value) : input);
  }
  return frames;
}
