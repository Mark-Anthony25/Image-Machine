import type { PixelImage } from '../processing/types';

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export function validateImageFile(file: Pick<File, 'type' | 'size'>): void {
  if (file.size > MAX_FILE_BYTES)
    throw new Error('This image is larger than 25 MB. Choose a smaller image or try a sample.');
  if (
    !['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/bmp'].includes(
      file.type,
    )
  ) {
    throw new Error(
      'Choose a PNG, JPEG, WebP, GIF, AVIF, or BMP image. You can also try a sample.',
    );
  }
}
export function fitDimensions(width: number, height: number, max = 960) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error('This image has no readable pixels. Try another image.');
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
export function pixelsFromDrawable(
  drawable: CanvasImageSource,
  width: number,
  height: number,
): PixelImage {
  const dimensions = fitDimensions(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context)
    throw new Error('Your browser cannot display image pixels. Try an up-to-date browser.');
  // Transparent input is composited on white so invisible RGB values do not
  // confuse beginners or the intensity algorithms.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(drawable, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height);
  return { ...dimensions, data: data.data };
}
export async function readImageFile(file: File): Promise<PixelImage> {
  validateImageFile(file);
  const url = URL.createObjectURL(file);
  try {
    return await readImageUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function readImageUrl(url: string): Promise<PixelImage> {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    throw new Error(
      'We could not read this image. It may be damaged or unsupported by your browser. Try another image or a sample.',
    );
  }
  return pixelsFromDrawable(image, image.naturalWidth, image.naturalHeight);
}
