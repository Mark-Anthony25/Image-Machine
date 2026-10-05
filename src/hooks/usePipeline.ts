import { useEffect, useRef, useState } from 'react';
import type { PixelImage, ProcessingResponse, ProcessingStep } from '../processing/types';

export function usePipeline(source: PixelImage | null, steps: ProcessingStep[]) {
  const workerRef = useRef<Worker | null>(null);
  const revision = useRef(0);
  const currentSource = useRef(source);
  const [generation, setGeneration] = useState(0);
  const [state, setState] = useState<{
    frames: PixelImage[];
    source: PixelImage | null;
    busy: boolean;
    error: string | null;
  }>({ frames: [], source: null, busy: false, error: null });
  useEffect(() => {
    let worker: Worker;
    try {
      worker = new Worker(new URL('../processing/processing.worker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      setState((s) => ({
        ...s,
        busy: false,
        error:
          'Your browser could not start the image processor. Reload or try an up-to-date browser.',
      }));
      return;
    }
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<ProcessingResponse>) => {
      const response = event.data;
      if (response.revision !== revision.current) return;
      if (response.error !== undefined)
        setState((s) => ({ ...s, busy: false, error: response.error }));
      else
        setState({
          frames: response.frames,
          source: currentSource.current,
          busy: false,
          error: null,
        });
    };
    worker.onerror = () => {
      worker.terminate();
      workerRef.current = null;
      setState((s) => ({
        ...s,
        busy: false,
        error: 'The image processor stopped. Restart the processor or try a smaller image.',
      }));
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [generation]);
  useEffect(() => {
    const current = ++revision.current;
    currentSource.current = source;
    if (!source || !workerRef.current) return;
    setState((s) => ({ ...s, busy: true, error: null }));
    const timer = window.setTimeout(
      () => workerRef.current?.postMessage({ revision: current, source, steps }),
      40,
    );
    return () => window.clearTimeout(timer);
  }, [source, steps, generation]);
  return {
    ...state,
    frames: state.source === source ? state.frames : [],
    retry: () => setGeneration((g) => g + 1),
  };
}
