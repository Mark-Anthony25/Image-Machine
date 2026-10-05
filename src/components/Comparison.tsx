import { useState } from 'react';
import { operationByType } from '../content/operations';
import type { PixelImage, ProcessingStep } from '../processing/types';
import { PixelCanvas } from './PixelCanvas';
import type { PixelPosition } from './PixelCanvas';
import { ImageSkeleton } from './PreviewSkeleton';
import { Icon } from './Icon';

interface Props {
  before: PixelImage;
  after: PixelImage;
  steps: ProcessingStep[];
  selected: string | null;
  scope: 'all' | 'step';
  onScope: (scope: 'all' | 'step') => void;
  pixel: PixelPosition | null;
  onPixel: (p: PixelPosition) => void;
  busy: boolean;
  loading: boolean;
  sourceName: string;
}
export function Comparison({
  before,
  after,
  steps,
  selected,
  scope,
  onScope,
  pixel,
  onPixel,
  busy,
  loading,
  sourceName,
}: Props) {
  const [mode, setMode] = useState<'split' | 'slider' | 'result'>('split'),
    [split, setSplit] = useState(50);
  const step = steps.find((s) => s.id === selected);
  const name = step ? operationByType[step.type].beginnerName : 'Selected step';
  const beforeLabel = 'Before processing. Click or tap to inspect a pixel.';
  const afterLabel = 'After processing. Click or tap to inspect a pixel.';
  return (
    <section className="preview" aria-labelledby="preview-heading">
      <div className="section-heading">
        <h2 id="preview-heading">Preview</h2>
        <span
          className={`processing-status ${busy ? 'working' : ''}`}
          role="status"
          aria-label="Processing status"
        >
          <span aria-hidden="true">{loading || busy ? '↻' : '✓'}</span>
          {loading ? 'Loading image…' : busy ? 'Updating…' : 'Ready'}
        </span>
      </div>
      <details className="view-options">
        <summary>View options</summary>
        <div className="preview-toolbar">
          <label className="scope-label">
            Compare
            <select
              aria-label="Compare images"
              value={scope}
              onChange={(e) => onScope(e.target.value as 'all' | 'step')}
            >
              <option value="all">Starting image → result</option>
              <option value="step" disabled={!step}>
                Before → {name}
              </option>
            </select>
          </label>
          <div className="segmented" aria-label="Comparison display">
            {(
              [
                ['split', 'Side by side'],
                ['slider', 'Slider'],
                ['result', 'Result'],
              ] as const
            ).map(([key, label]) => (
              <button key={key} aria-pressed={mode === key} onClick={() => setMode(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </details>
      {loading ? (
        <ImageSkeleton mode={mode} />
      ) : mode === 'split' ? (
        <div className="split-preview" aria-busy={busy}>
          <figure>
            <figcaption>
              <span>Before</span>
              <small>{scope === 'all' ? 'Original image' : 'Before this step'}</small>
            </figcaption>
            <div className="image-surface">
              <PixelCanvas image={before} label={beforeLabel} pixel={pixel} onPixel={onPixel} />
            </div>
          </figure>
          <figure>
            <figcaption>
              <span>After</span>
              <small>{scope === 'all' ? 'Your result' : name}</small>
            </figcaption>
            <div className="image-surface">
              <PixelCanvas image={after} label={afterLabel} pixel={pixel} onPixel={onPixel} />
            </div>
          </figure>
        </div>
      ) : mode === 'slider' ? (
        <div className="slider-preview" aria-busy={busy}>
          <div className="slider-images image-surface">
            <PixelCanvas image={after} label={afterLabel} pixel={pixel} onPixel={onPixel} />
            <div className="slider-before" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <PixelCanvas image={before} label={beforeLabel} pixel={pixel} onPixel={onPixel} />
            </div>
            <span className="slider-divider" style={{ left: `${split}%` }} aria-hidden="true">
              <span>↔</span>
            </span>
            <span className="image-badge before-badge">Before</span>
            <span className="image-badge after-badge">After</span>
          </div>
          <label className="comparison-slider">
            Slide to compare
            <input
              type="range"
              min="0"
              max="100"
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label="Before and after comparison"
            />
          </label>
        </div>
      ) : (
        <figure className="result-preview" aria-busy={busy}>
          <figcaption>
            <span>Your result</span>
            <small>{scope === 'all' ? 'Your steps' : name}</small>
          </figcaption>
          <div className="image-surface">
            <PixelCanvas image={after} label={afterLabel} pixel={pixel} onPixel={onPixel} />
          </div>
        </figure>
      )}
      <div className="preview-meta">
        <span>
          <Icon name="pixel" size={15} /> {sourceName}
        </span>
        <span>Tap an image to explore its pixels</span>
      </div>
    </section>
  );
}
