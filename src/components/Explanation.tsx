import { useState } from 'react';
import { operationByType } from '../content/operations';
import type { OperationType, PixelImage } from '../processing/types';
import { intensity } from '../processing/operations';
import type { PixelPosition } from './PixelCanvas';
import { Icon } from './Icon';
import { operationIcons } from './StepList';

export function Explanation({
  type,
  before,
  pixel,
  enabled = true,
  hasSequence = false,
}: {
  type: OperationType | null;
  before: PixelImage;
  pixel: PixelPosition | null;
  enabled?: boolean;
  hasSequence?: boolean;
}) {
  const [understand, setUnderstand] = useState(false);
  const op = type
    ? operationByType[type]
    : {
        beginnerName: 'Original image',
        technicalName: 'Input image',
        simpleExplanation: 'This is your starting image. Add a step to see it change.',
        detailedExplanation:
          'An image is made of tiny squares called pixels. Each pixel stores red, green, and blue numbers. Changing those numbers changes the image.',
        technicalExplanation:
          'Each pixel contains three 8-bit color channels: R, G, and B. Each channel ranges from 0 to 255. Add a step to transform these values and compare the result.',
        purpose: 'Keeping your starting image beside the result helps you see what changed.',
      };
  const p = pixel ?? { x: Math.floor(before.width / 2), y: Math.floor(before.height / 2) };
  const i = (p.y * before.width + p.x) * 4;
  const [r, g, b] = [before.data[i], before.data[i + 1], before.data[i + 2]];
  return (
    <section className="explanation" aria-labelledby="explanation-heading">
      <div className="explanation-heading">
        <span className="operation-icon">
          <Icon name={type ? operationIcons[type] : 'pixel'} />
        </span>
        <div>
          {type && <span className="explanation-context">About this step</span>}
          <h2 id="explanation-heading">{op.beginnerName}</h2>
        </div>
      </div>
      <p className="simple-explanation">
        {enabled ? op.simpleExplanation : 'This step is off, so it leaves the image unchanged.'}
      </p>
      <button
        className="why-button"
        onClick={() => setUnderstand(!understand)}
        aria-expanded={understand}
      >
        <Icon name="book" size={18} /> Why it works
        <Icon name={understand ? 'up' : 'down'} size={16} />
      </button>
      {understand && (
        <div className="understand-content">
          {!enabled && <p>Turn this step on to try it.</p>}
          <p>{op.detailedExplanation}</p>
          {hasSequence && (
            <p className="sequence-explanation">
              Each step uses the result of the one before it. Try changing the order.
            </p>
          )}
          <h3>Why use this?</h3>
          <p>{op.purpose}</p>
          <details className="look-inside">
            <summary>
              <span>Look inside</span>
              <span className="small muted">Optional · names and numbers</span>
            </summary>
            <div className="technical-content">
              <span className="eyebrow">In code, this is called</span>
              <h3>{op.technicalName}</h3>
              {!enabled && <p>This is how the operation works when enabled.</p>}
              <p>{op.technicalExplanation}</p>
              {type === 'grayscale' && (
                <div className="formula">
                  <span>
                    This pixel: R {r} · G {g} · B {b}
                  </span>
                  <code>
                    0.299({r}) + 0.587({g}) + 0.114({b})
                  </code>
                  <strong>Brightness ≈ {Math.round(intensity(r, g, b))}</strong>
                </div>
              )}
              {hasSequence && (
                <p>
                  A sequence of steps is called an image-processing pipeline. Each step uses the
                  result of the one before it.
                </p>
              )}
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
