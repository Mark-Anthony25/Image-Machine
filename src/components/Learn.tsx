import type { PixelImage } from '../processing/types';
import { OrderExperiment } from './OrderExperiment';
import { Icon } from './Icon';
import { operations } from '../content/operations';

export function Learn({
  source,
  onPlayground,
}: {
  source: PixelImage | null;
  onPlayground: () => void;
}) {
  return (
    <div className="learning-page">
      <div className="page-intro">
        <span className="eyebrow">See it → Try it → Understand it → Look inside</span>
        <h1>A picture is a lot of little numbers.</h1>
        <p>
          You don’t need code or equations to start. Change an image, notice the difference, then
          ask why.
        </p>
        <button className="primary-button" onClick={onPlayground}>
          Try it in the playground
        </button>
      </div>
      <section className="pixels-lesson">
        <div>
          <span className="eyebrow">Start here</span>
          <h2>Meet a pixel.</h2>
          <p>
            A digital image is a grid of tiny squares called pixels. Every color pixel has three
            numbers: red, green, and blue.
          </p>
          <p>
            Each number ranges from <strong>0</strong> (none of that color) to <strong>255</strong>{' '}
            (the most). Together, the numbers describe a color.
          </p>
          <p>Changing these numbers can help a computer find shapes and details.</p>
        </div>
        <div className="rgb-demo">
          <div className="demo-color" role="img" aria-label="Example orange pixel" />
          <dl>
            <div>
              <dt>Red</dt>
              <dd>218</dd>
            </div>
            <div>
              <dt>Green</dt>
              <dd>94</dd>
            </div>
            <div>
              <dt>Blue</dt>
              <dd>61</dd>
            </div>
          </dl>
          <span className="small muted">One color. Three values.</span>
        </div>
      </section>
      <section className="learning-operations">
        <span className="eyebrow">Five simple changes</span>
        <h2>Small steps, useful changes.</h2>
        <div className="learning-operation-grid">
          {operations.map((o, i) => (
            <article key={o.type}>
              <span className="section-number">0{i + 1}</span>
              <h3>{o.beginnerName}</h3>
              <p>{o.simpleExplanation}</p>
              <details>
                <summary>Why use it?</summary>
                <p>{o.purpose}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
      <OrderExperiment source={source} />
      <div className="learning-end">
        <Icon name="pixel" />
        <p>
          An image is made of pixels containing numbers. Image processing changes those values step
          by step to reveal useful details.
        </p>
      </div>
    </div>
  );
}
