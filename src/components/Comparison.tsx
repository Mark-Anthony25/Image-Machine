import { useState } from 'react';
import { operationByType } from '../content/operations';
import type { PixelImage, ProcessingStep } from '../processing/types';
import { PixelCanvas } from './PixelCanvas';
import type { PixelPosition } from './PixelCanvas';
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
        <h2 id="preview-heading">
          <span className="section-number">03</span> See what changes
        </h2>
        <span
          className={`processing-status ${busy ? 'working' : ''}`}
          role="status"
          aria-label="Processing status"
        >
          <span aria-hidden="true">{busy ? '↻' : '✓'}</span>
          {busy ? 'Changing pixels…' : 'Ready to experiment'}
        </span>
      </div>
      <div className="preview-toolbar">
        <label className="scope-label">
          Compare
          <select
            aria-label="Comparison scope"
            value={scope}
            onChange={(e) => onScope(e.target.value as 'all' | 'step')}
          >
            <option value="all">Original → final result</option>
            <option value="step" disabled={!step}>
              Input → {name}
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
      {mode === 'split' ? (
        <div className="split-preview">
          <figure>
            <figcaption>
              <span>Before</span>
              <small>{scope === 'all' ? 'Original image' : 'Step input'}</small>
            </figcaption>
            <PixelCanvas image={before} label={beforeLabel} pixel={pixel} onPixel={onPixel} />
          </figure>
          <figure>
            <figcaption>
              <span>After</span>
              <small>{scope === 'all' ? 'Your result' : name}</small>
            </figcaption>
            <PixelCanvas image={after} label={afterLabel} pixel={pixel} onPixel={onPixel} />
          </figure>
        </div>
      ) : mode === 'slider' ? (
        <div className="slider-preview">
          <div className="slider-images">
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
        <figure className="result-preview">
          <figcaption>
            <span>Your result</span>
            <small>{scope === 'all' ? 'All enabled steps' : name}</small>
          </figcaption>
          <PixelCanvas image={after} label={afterLabel} pixel={pixel} onPixel={onPixel} />
        </figure>
      )}
      <div className="preview-meta">
        <span>
          <Icon name="pixel" size={15} /> {sourceName} · {after.width} × {after.height} pixels
        </span>
        <span>Click or tap to look at a pixel</span>
      </div>
      <div className="machine-model" aria-label="Learning model">
        <span>Image</span>
        <Icon name="arrow" size={15} />
        <span>Pixels</span>
        <Icon name="arrow" size={15} />
        <span>Transformation</span>
        <Icon name="arrow" size={15} />
        <span>New values</span>
        <Icon name="arrow" size={15} />
        <span>Useful information</span>
      </div>
    </section>
  );
}
