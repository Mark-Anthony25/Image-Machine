import { Icon } from './Icon';

export function LearningModel() {
  return (
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
  );
}

/** Reserves the same image area as the preview while an input is decoded. */
export function ImageSkeleton({ mode = 'split' }: { mode?: 'split' | 'slider' | 'result' }) {
  return (
    <div className="preview-placeholder" role="status" aria-label="Loading image preview">
      <span className="visually-hidden">Loading your image. The preview will appear here.</span>
      {mode === 'split' ? (
        <div className="split-preview" aria-hidden="true" aria-busy="true">
          {[0, 1].map((side) => (
            <div key={side}>
              <div className="skeleton-caption">
                <span className="skeleton-line" />
              </div>
              <div className="image-surface skeleton-image" />
            </div>
          ))}
        </div>
      ) : mode === 'slider' ? (
        <div className="slider-preview" aria-hidden="true" aria-busy="true">
          <div className="image-surface skeleton-image" />
          <label className="comparison-slider">
            Slide to compare
            <input type="range" disabled tabIndex={-1} aria-label="Loading comparison" />
          </label>
        </div>
      ) : (
        <div className="result-preview" aria-hidden="true" aria-busy="true">
          <div className="skeleton-caption">
            <span className="skeleton-line" />
          </div>
          <div className="image-surface skeleton-image" />
        </div>
      )}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <section className="preview" aria-labelledby="preview-heading">
      <div className="section-heading">
        <h2 id="preview-heading">Preview</h2>
        <span className="processing-status">Loading image…</span>
      </div>
      <div className="preview-toolbar skeleton-toolbar" aria-hidden="true">
        <span className="skeleton-line" />
        <span className="skeleton-line" />
      </div>
      <ImageSkeleton />
      <div className="preview-meta">
        <span>Preparing your image for local processing</span>
        <span>Click or tap to look at a pixel</span>
      </div>
      <LearningModel />
    </section>
  );
}
