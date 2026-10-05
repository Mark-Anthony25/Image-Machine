export type OperationType = 'grayscale' | 'brightness' | 'blur' | 'threshold' | 'edges';
export interface PixelImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
export interface ProcessingStep {
  id: string;
  type: OperationType;
  enabled: boolean;
  value: number;
}
export interface ProcessingRequest {
  revision: number;
  source: PixelImage;
  steps: ProcessingStep[];
}
export type ProcessingResponse =
  | { revision: number; frames: PixelImage[]; error?: never }
  | { revision: number; frames?: never; error: string };
