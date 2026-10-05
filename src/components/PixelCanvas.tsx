import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { PixelImage } from '../processing/types';

export interface PixelPosition {
  x: number;
  y: number;
}
export function PixelCanvas({
  image,
  label,
  pixel,
  onPixel,
}: {
  image: PixelImage;
  label: string;
  pixel?: PixelPosition | null;
  onPixel?: (position: PixelPosition) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.putImageData(
      new ImageData(new Uint8ClampedArray(image.data), image.width, image.height),
      0,
      0,
    );
    if (pixel) {
      const { x, y } = pixel;
      const size = Math.max(4, image.width / 100);
      context.strokeStyle = '#fff';
      context.lineWidth = 3;
      context.strokeRect(x - size, y - size, size * 2, size * 2);
      context.strokeStyle = '#172d27';
      context.lineWidth = 1;
      context.strokeRect(x - size, y - size, size * 2, size * 2);
    }
  }, [image, pixel]);
  function keyDown(e: KeyboardEvent<HTMLCanvasElement>) {
    if (!onPixel) return;
    const p = pixel ?? { x: Math.floor(image.width / 2), y: Math.floor(image.height / 2) };
    const change: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    if (change[e.key]) {
      e.preventDefault();
      const [dx, dy] = change[e.key];
      onPixel({
        x: Math.max(0, Math.min(image.width - 1, p.x + dx)),
        y: Math.max(0, Math.min(image.height - 1, p.y + dy)),
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPixel(p);
    }
  }
  return (
    <canvas
      ref={ref}
      width={image.width}
      height={image.height}
      role="img"
      aria-label={label}
      tabIndex={onPixel ? 0 : undefined}
      onKeyDown={keyDown}
      onClick={(e) => {
        if (!onPixel) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onPixel({
          x: Math.max(
            0,
            Math.min(
              image.width - 1,
              Math.floor(((e.clientX - rect.left) / rect.width) * image.width),
            ),
          ),
          y: Math.max(
            0,
            Math.min(
              image.height - 1,
              Math.floor(((e.clientY - rect.top) / rect.height) * image.height),
            ),
          ),
        });
      }}
    />
  );
}
