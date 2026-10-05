import { describe, expect, it } from 'vitest';
import { fitDimensions, validateImageFile } from '../src/lib/image-input';

describe('image input limits', () => {
  it('preserves aspect ratio and does not upscale small images', () => {
    expect(fitDimensions(8000, 4000)).toEqual({ width: 960, height: 480 });
    expect(fitDimensions(4000, 8000)).toEqual({ width: 480, height: 960 });
    expect(fitDimensions(100, 50)).toEqual({ width: 100, height: 50 });
    expect(fitDimensions(100000, 1)).toEqual({ width: 960, height: 1 });
  });
  it('rejects non-images, SVG, and files larger than 25 MB', () => {
    expect(() => validateImageFile({ type: 'text/plain', size: 12 })).toThrow('PNG');
    expect(() => validateImageFile({ type: 'image/svg+xml', size: 12 })).toThrow('PNG');
    expect(() => validateImageFile({ type: 'image/png', size: 26 * 1024 * 1024 })).toThrow('25 MB');
    expect(() => validateImageFile({ type: 'image/png', size: 100 })).not.toThrow();
  });
  it('rejects invalid dimensions rather than dividing by zero', () => {
    expect(() => fitDimensions(0, 100)).toThrow();
  });
});
