import { useMemo, useState } from 'react';
import { usePipeline } from '../hooks/usePipeline';
import type { PixelImage, ProcessingStep } from '../processing/types';
import { PixelCanvas } from './PixelCanvas';
import { Icon } from './Icon';

export function OrderExperiment({ source }: { source: PixelImage | null }) {
  const [tried, setTried] = useState(false);
  const a = useMemo<ProcessingStep[]>(
    () => [
      { id: 'a-gray', type: 'grayscale', value: 0, enabled: true },
      { id: 'a-blur', type: 'blur', value: 2, enabled: true },
      { id: 'a-edge', type: 'edges', value: 1, enabled: true },
    ],
    [],
  );
  const b = useMemo<ProcessingStep[]>(() => [a[0], a[2], a[1]], [a]);
  const first = usePipeline(tried ? source : null, a),
    second = usePipeline(tried ? source : null, b);
  const ready =
    tried && !first.busy && !second.busy && first.frames.length === 4 && second.frames.length === 4;
  return (
    <section className="order-experiment">
      <span className="eyebrow">A small experiment</span>
      <h2>Same steps. Different order.</h2>
      <p>Do you think these will look the same?</p>
      <div className="order-recipes">
        <div>
          <span className="recipe-letter">A</span>
          <span>Soften</span>
          <Icon name="arrow" size={18} />
          <span>Find edges</span>
        </div>
        <div>
          <span className="recipe-letter">B</span>
          <span>Find edges</span>
          <Icon name="arrow" size={18} />
          <span>Soften</span>
        </div>
      </div>
      <button
        className="primary-button"
        disabled={!source || first.busy || second.busy}
        onClick={() => setTried(true)}
      >
        {first.busy || second.busy
          ? 'Changing pixels…'
          : tried
            ? 'Try both orders again'
            : 'Try both orders'}
      </button>
      {(first.error || second.error) && <p role="alert">{first.error || second.error}</p>}
      {ready && (
        <>
          <div className="order-results">
            <figure>
              <figcaption>A · Soften, then Find edges</figcaption>
              <PixelCanvas image={first.frames[3]} label="Soften then find edges result" />
            </figure>
            <figure>
              <figcaption>B · Find edges, then Soften</figcaption>
              <PixelCanvas image={second.frames[3]} label="Find edges then soften result" />
            </figure>
          </div>
          <div className="discovery-note">
            <Icon name="book" />
            <div>
              <strong>You built a sequence of steps.</strong>
              <p>Each step uses the result of the one before it.</p>
              <p>
                Soften first to remove small specks before finding outlines. Soften afterward to
                blur the outlines you already found. This sequence is called an image-processing
                pipeline.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
