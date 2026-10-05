import { describe, expect, it } from 'vitest';
import { processOperation } from '../src/processing/operations';
import { runPipeline } from '../src/processing/pipeline';
import type { PixelImage, ProcessingStep } from '../src/processing/types';

const image = (values: number[][], width = values.length): PixelImage => ({
  width,
  height: values.length / width,
  data: new Uint8ClampedArray(values.flatMap((v) => [...v, 255])),
});
const step = (type: ProcessingStep['type'], value = 1, enabled = true): ProcessingStep => ({
  id: type,
  type,
  value,
  enabled,
});

describe('pixel transformations', () => {
  it('combines RGB into weighted intensity with exact rounding', () => {
    expect([...processOperation(image([[218, 94, 61]]), 'grayscale', 0).data]).toEqual([
      127, 127, 127, 255,
    ]);
  });
  it('adjusts brightness and clips at both ends', () => {
    expect([...processOperation(image([[250, 100, 0]]), 'brightness', 30).data]).toEqual([
      255, 130, 30, 255,
    ]);
    expect([...processOperation(image([[250, 100, 0]]), 'brightness', -120).data]).toEqual([
      130, 0, 0, 255,
    ]);
  });
  it('uses an inclusive threshold and produces only black or white', () => {
    expect([
      ...processOperation(
        image([
          [127, 127, 127],
          [128, 128, 128],
        ]),
        'threshold',
        128,
      ).data,
    ]).toEqual([0, 0, 0, 255, 255, 255, 255, 255]);
  });
  it('does not mutate source and preserves alpha', () => {
    const source = image([[100, 50, 20]]);
    source.data[3] = 90;
    for (const type of ['grayscale', 'brightness', 'blur', 'threshold', 'edges'] as const) {
      const result = processOperation(source, type, 1);
      expect(result.data[3]).toBe(90);
      expect([...source.data]).toEqual([100, 50, 20, 90]);
      expect(result.data).not.toBe(source.data);
    }
  });
  it('keeps a constant image constant through Gaussian blur, including borders', () => {
    const source = image(
      Array.from({ length: 25 }, () => [73, 92, 121]),
      5,
    );
    expect(processOperation(source, 'blur', 2).data).toEqual(source.data);
  });
  it('spreads an impulse into neighboring pixels symmetrically', () => {
    const source = image(
      Array.from({ length: 49 }, (_, i) => (i === 24 ? [255, 255, 255] : [0, 0, 0])),
      7,
    );
    const out = processOperation(source, 'blur', 1).data;
    expect(out[24 * 4]).toBeGreaterThan(out[23 * 4]);
    expect(out[23 * 4]).toBeGreaterThan(0);
    expect(out[23 * 4]).toBe(out[25 * 4]);
    expect(out[17 * 4]).toBe(out[31 * 4]);
  });
  it('finds no edges in a flat image and visible edges at a boundary', () => {
    expect(
      processOperation(
        image(
          Array.from({ length: 9 }, () => [80, 80, 80]),
          3,
        ),
        'edges',
        1,
      ).data[16],
    ).toBe(0);
    const source = image(
      Array.from({ length: 9 }, (_, i) => (i % 3 === 2 ? [255, 255, 255] : [0, 0, 0])),
      3,
    );
    expect(processOperation(source, 'edges', 1).data[16]).toBe(255);
  });
  it('handles a one-pixel image and blur strength zero safely', () => {
    const source = image([[30, 60, 90]]);
    expect(processOperation(source, 'blur', 0).data).toEqual(source.data);
    expect(processOperation(source, 'blur', 3).data).toEqual(source.data);
    expect([...processOperation(source, 'edges', 1).data]).toEqual([0, 0, 0, 255]);
  });
});

describe('pipeline', () => {
  it('keeps one frame per step, skips disabled work, and keeps original intact', () => {
    const source = image([[250, 100, 0]]);
    const frames = runPipeline(source, [step('grayscale', 0, false), step('brightness', 10)]);
    expect(frames).toHaveLength(3);
    expect(frames[0].data).toEqual(source.data);
    expect(frames[1].data).toEqual(source.data);
    expect([...frames[2].data]).toEqual([255, 110, 10, 255]);
  });
  it('demonstrates that operation order changes information', () => {
    const source = image(
      Array.from({ length: 81 }, (_, i) => (i === 40 ? [255, 255, 255] : [0, 0, 0])),
      9,
    );
    const a = runPipeline(source, [step('blur', 1.5), step('edges', 1)]).at(-1)!;
    const b = runPipeline(source, [step('edges', 1), step('blur', 1.5)]).at(-1)!;
    expect(a.data).not.toEqual(b.data);
  });
});
