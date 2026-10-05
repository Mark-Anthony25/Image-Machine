import { useEffect, useRef, useState } from 'react';
import { pixelsFromDrawable } from '../lib/image-input';
import type { PixelImage } from '../processing/types';
import { Icon } from './Icon';

export function CameraDialog({
  onClose,
  onCapture,
}: {
  onClose: () => void;
  onCapture: (image: PixelImage) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(''),
    [ready, setReady] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    let cancelled = false;
    let stream: MediaStream | undefined;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          'Camera access is not available here. Try uploading an image or choosing a sample.',
        );
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
        }
      } catch {
        if (!cancelled)
          setError(
            'We could not open your camera. Allow camera access in your browser, or use an image or sample instead.',
          );
      }
    }
    void start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  function capture() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    try {
      onCapture(pixelsFromDrawable(v, v.videoWidth, v.videoHeight));
      onClose();
    } catch {
      setError('We could not capture that frame. Try again or choose a sample.');
    }
  }
  return (
    <dialog
      ref={dialog}
      className="camera-dialog"
      aria-labelledby="camera-title"
      onCancel={onClose}
    >
      <div className="section-heading">
        <h2 id="camera-title">Use your camera</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close camera">
          <Icon name="close" />
        </button>
      </div>
      <p>Your camera preview stays on this device.</p>
      {error ? (
        <p role="alert" className="error-message">
          {error}
        </p>
      ) : (
        <video
          ref={video}
          autoPlay
          muted
          playsInline
          onLoadedData={() => setReady(true)}
          aria-label="Live camera preview"
        />
      )}
      <div className="dialog-actions">
        <button onClick={onClose} className="secondary-button">
          Cancel
        </button>
        <button onClick={capture} disabled={!ready || !!error} className="primary-button">
          <Icon name="camera" /> Capture image
        </button>
      </div>
    </dialog>
  );
}
