import { useRef, useState } from 'react';
import { samples } from '../content/samples';
import { Icon } from './Icon';

export function ImageInput({
  sampleId,
  onFile,
  onSample,
  onCamera,
  loading,
}: {
  sampleId: string;
  onFile: (file: File) => void;
  onSample: (id: string) => void;
  onCamera: () => void;
  loading: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <section
      className={`image-input ${dragging ? 'drag-over' : ''}`}
      aria-labelledby="input-heading"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <div className="section-heading">
        <h2 id="input-heading">
          <span className="section-number">01</span> Put an image in
        </h2>
        <span className="small muted">
          {loading ? 'Loading image…' : 'Start with a sample or your own'}
        </span>
      </div>
      <div className="input-options">
        <div className="source-buttons">
          <button className="secondary-button" onClick={() => file.current?.click()}>
            <Icon name="upload" /> Upload image
          </button>
          <button className="secondary-button" onClick={onCamera}>
            <Icon name="camera" /> Use camera
          </button>
          <span className="drop-note">or drop an image here</span>
        </div>
        <input
          ref={file}
          type="file"
          className="visually-hidden"
          tabIndex={-1}
          aria-label="Image file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
        <div className="samples" aria-label="Sample images">
          {samples.map((s) => (
            <button
              key={s.id}
              className={`sample ${sampleId === s.id ? 'selected' : ''}`}
              onClick={() => onSample(s.id)}
              aria-label={`Use sample ${s.name}`}
              aria-pressed={sampleId === s.id}
            >
              <img src={s.src} alt="" />
              <span>
                {s.name}
                <small>{s.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
