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
}: {
  type: OperationType | null;
  before: PixelImage;
  pixel: PixelPosition | null;
  enabled?: boolean;
}) {
  const [understand, setUnderstand] = useState(false);
  const op = type
    ? operationByType[type]
    : {
        beginnerName: 'Original image',
        technicalName: 'Input image',
        simpleExplanation:
          'This is the untouched image. Every transformation starts with input pixels.',
        detailedExplanation:
          'An image is a grid of pixels. Each color pixel contains red, green, and blue numbers. The original image is the input data that each processing step builds on.',
        technicalExplanation:
          'Each pixel contains three 8-bit color channels: R, G, and B. Each channel ranges from 0 to 255. Add a step to transform these values and compare the result.',
        purpose:
          'The input image is the starting information. Keeping it available helps you see exactly what each transformation changed.',
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
          <span className="eyebrow">{type ? 'What just happened?' : 'Where it all begins'}</span>
          <h2 id="explanation-heading">{op.beginnerName}</h2>
        </div>
        <span className="level-label">SEE</span>
      </div>
      <p className="simple-explanation">
        {enabled
          ? op.simpleExplanation
          : 'This step is off. Its input pixels pass through unchanged.'}
      </p>
      <button
        className="why-button"
        onClick={() => setUnderstand(!understand)}
        aria-expanded={understand}
      >
        <Icon name="book" size={18} /> Why did this happen?
        <Icon name={understand ? 'up' : 'down'} size={16} />
      </button>
      {understand && (
        <div className="understand-content">
          <span className="eyebrow">Understand</span>
          {!enabled && <p>Turn this step on to try the transformation described below.</p>}
          <p>{op.detailedExplanation}</p>
          <h3>Why would a computer do this?</h3>
          <p>{op.purpose}</p>
        </div>
      )}
      <details className="look-inside">
        <summary>
          <span>Look inside</span>
          <span className="small muted">Optional · the technical process</span>
        </summary>
        <div className="technical-content">
          <span className="eyebrow">Technical name</span>
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
              <strong>Intensity ≈ {Math.round(intensity(r, g, b))}</strong>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
