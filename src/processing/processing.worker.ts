/// <reference lib="webworker" />
import { runPipeline } from './pipeline';
import type { ProcessingRequest, ProcessingResponse } from './types';

const worker = self as unknown as DedicatedWorkerGlobalScope;
let pending: ProcessingRequest | null = null;
let scheduled = false;
worker.onmessage = (event: MessageEvent<ProcessingRequest>) => {
  pending = event.data;
  if (scheduled) return;
  scheduled = true;
  // Drain bursts of slider messages before performing expensive work.
  setTimeout(() => {
    scheduled = false;
    const request = pending!;
    pending = null;
    try {
      const frames = runPipeline(request.source, request.steps);
      const response: ProcessingResponse = { revision: request.revision, frames };
      worker.postMessage(response);
    } catch {
      worker.postMessage({
        revision: request.revision,
        error:
          'The machine could not finish this recipe. Remove a step or reset the recipe and try again.',
      } satisfies ProcessingResponse);
    }
  }, 0);
};
