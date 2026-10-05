import type { OperationType, PixelImage } from './types';

export const intensity = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

/** Separable Gaussian convolution, with replicated border pixels. */
function gaussian(source: PixelImage, sigma: number): PixelImage {
  const { width, height, data } = source;
  if (sigma <= 0) return { width, height, data: data.slice() };
  const radius = Math.ceil(sigma * 3);
  const kernel = Array.from({ length: 2 * radius + 1 }, (_, i) =>
    Math.exp(-((i - radius) ** 2) / (2 * sigma ** 2)),
  );
  const sum = kernel.reduce((a, b) => a + b, 0);
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  const horizontal = new Float32Array(data.length);
  const result = data.slice();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let value = 0;
        for (let k = -radius; k <= radius; k++)
          value += data[(y * width + clamp(x + k, width - 1)) * 4 + c] * kernel[k + radius];
        horizontal[index + c] = value;
      }
    }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        let value = 0;
        for (let k = -radius; k <= radius; k++)
          value += horizontal[(clamp(y + k, height - 1) * width + x) * 4 + c] * kernel[k + radius];
        result[index + c] = Math.round(value);
      }
    }
  return { width, height, data: result };
}

function sobel(source: PixelImage, sensitivity: number): PixelImage {
  const { width, height, data } = source;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++)
    gray[i] = intensity(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const result = data.slice();
  const at = (x: number, y: number) => gray[clamp(y, height - 1) * width + clamp(x, width - 1)];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const gx =
        -at(x - 1, y - 1) +
        at(x + 1, y - 1) -
        2 * at(x - 1, y) +
        2 * at(x + 1, y) -
        at(x - 1, y + 1) +
        at(x + 1, y + 1);
      const gy =
        -at(x - 1, y - 1) -
        2 * at(x, y - 1) -
        at(x + 1, y - 1) +
        at(x - 1, y + 1) +
        2 * at(x, y + 1) +
        at(x + 1, y + 1);
      const value = Math.round(clamp((Math.hypot(gx, gy) * sensitivity) / 4, 255));
      const index = (y * width + x) * 4;
      result[index] = result[index + 1] = result[index + 2] = value;
    }
  return { width, height, data: result };
}

export function processOperation(
  source: PixelImage,
  type: OperationType,
  value: number,
): PixelImage {
  if (type === 'blur') return gaussian(source, clamp(value, 4));
  if (type === 'edges') return sobel(source, clamp(value, 3));
  const data = source.data.slice();
  for (let i = 0; i < data.length; i += 4) {
    if (type === 'brightness') {
      for (let c = 0; c < 3; c++) data[i + c] = Math.round(clamp(data[i + c] + value, 255));
    } else {
      const gray = Math.round(intensity(data[i], data[i + 1], data[i + 2]));
      const next = type === 'threshold' ? (gray >= value ? 255 : 0) : gray;
      data[i] = data[i + 1] = data[i + 2] = next;
    }
  }
  return { width: source.width, height: source.height, data };
}
