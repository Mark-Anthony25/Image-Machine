import type { PixelImage } from '../processing/types';
import type { PixelPosition } from './PixelCanvas';
import { Icon } from './Icon';

function rgbAt(image: PixelImage, pixel: PixelPosition) {
  const index = (pixel.y * image.width + pixel.x) * 4;
  return [image.data[index], image.data[index + 1], image.data[index + 2]];
}
function PixelValues({
  image,
  pixel,
  kind,
}: {
  image: PixelImage;
  pixel: PixelPosition;
  kind: 'before' | 'after';
}) {
  const values = rgbAt(image, pixel);
  const gray = values[0] === values[1] && values[1] === values[2];
  return (
    <div className="pixel-values" data-testid={`pixel-${kind}`} data-rgb={values.join(',')}>
      <div className="pixel-values-heading">
        <span className="eyebrow">{kind}</span>
        <span
          className="color-swatch"
          role="img"
          style={{ background: `rgb(${values.join(',')})` }}
          aria-label={`Pixel color: red ${values[0]}, green ${values[1]}, blue ${values[2]}`}
        />
      </div>
      <dl>
        {values.map((v, i) => (
          <div key={i}>
            <dt>{['Red', 'Green', 'Blue'][i]}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {gray && (
        <p className="intensity-label">
          Intensity <strong>{values[0]}</strong>
        </p>
      )}
    </div>
  );
}
export function PixelInspector({
  before,
  after,
  pixel,
  onPixel,
}: {
  before: PixelImage;
  after: PixelImage;
  pixel: PixelPosition | null;
  onPixel: (p: PixelPosition) => void;
}) {
  const p = pixel ?? { x: Math.floor(before.width / 2), y: Math.floor(before.height / 2) };
  return (
    <section className="inspector" aria-labelledby="inspector-heading">
      <div className="section-heading">
        <h2 id="inspector-heading">
          <Icon name="pixel" size={20} /> Pixel inspector
        </h2>
        <span className="small muted">The numbers behind the image</span>
      </div>
      {!pixel ? (
        <div className="inspector-empty">
          <div className="pixel-grid-icon" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>
            Every image is made of tiny pixels.
            <br />
            <span className="muted">Click anywhere on an image to meet one.</span>
          </p>
          <button className="text-button" onClick={() => onPixel(p)}>
            Inspect the center pixel
          </button>
        </div>
      ) : (
        <>
          <div className="pixel-position" aria-live="polite">
            <span>Selected pixel</span>
            <strong>
              X: {p.x} <span className="muted">/</span> Y: {p.y}
            </strong>
          </div>
          <div className="pixel-compare">
            <PixelValues image={before} pixel={p} kind="before" />
            <Icon name="arrow" size={20} />
            <PixelValues image={after} pixel={p} kind="after" />
          </div>
          <div className="neighborhood">
            <div className="pixel-neighbors" aria-label="Magnified 5 by 5 pixel neighborhood">
              {Array.from({ length: 25 }, (_, i) => {
                const x = Math.max(0, Math.min(after.width - 1, p.x + (i % 5) - 2));
                const y = Math.max(0, Math.min(after.height - 1, p.y + Math.floor(i / 5) - 2));
                return (
                  <button
                    key={i}
                    className={i === 12 ? 'center-pixel' : ''}
                    style={{ background: `rgb(${rgbAt(after, { x, y }).join(',')})` }}
                    aria-label={`Inspect pixel ${x}, ${y}`}
                    onClick={() => onPixel({ x, y })}
                  />
                );
              })}
            </div>
            <p>
              One pixel, up close.
              <br />
              <span className="muted">Each channel is a number from 0 to 255.</span>
            </p>
          </div>
          <p className="small muted">Focus an image and use arrow keys to move one pixel.</p>
        </>
      )}
    </section>
  );
}
