import { processOperation } from '../processing/operations';
import type { OperationType, PixelImage } from '../processing/types';

export interface OperationDefinition {
  type: OperationType;
  beginnerName: string;
  technicalName: string;
  description: string;
  simpleExplanation: string;
  detailedExplanation: string;
  technicalExplanation: string;
  purpose: string;
  parameter: {
    label: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    unit: string;
  } | null;
  process: (image: PixelImage, value: number) => PixelImage;
}
const define = (content: Omit<OperationDefinition, 'process'>): OperationDefinition => ({
  ...content,
  process: (image, value) => processOperation(image, content.type, value),
});
export const operations: OperationDefinition[] = [
  define({
    type: 'grayscale',
    beginnerName: 'Remove color',
    technicalName: 'Grayscale conversion',
    description: 'Turn colors into shades of gray.',
    simpleExplanation: 'The colors become shades of gray. Light and dark areas remain.',
    detailedExplanation:
      'Every tiny square in an image is a pixel. Its red, green, and blue numbers describe its color. This step combines those numbers to show how light or dark the pixel is.',
    technicalExplanation:
      'Gray = round(0.299 × R + 0.587 × G + 0.114 × B). Each output channel receives this value. Green has the largest weight because human vision is especially sensitive to it.',
    purpose:
      'Sometimes a computer only needs light and dark areas to find a shape. Color can be left out.',
    parameter: null,
  }),
  define({
    type: 'brightness',
    beginnerName: 'Adjust brightness',
    technicalName: 'Intensity adjustment',
    description: 'Make the image lighter or darker.',
    simpleExplanation: 'The image gets lighter or darker.',
    detailedExplanation:
      'Pixels store color as numbers from 0 to 255. Raising the numbers makes the image lighter; lowering them makes it darker. At either limit, some details can disappear.',
    technicalExplanation:
      'Output channel = clamp(input channel + adjustment, 0, 255). For example, 240 + 30 becomes 255, not 270. Hitting a limit is called clipping. Clipped information cannot be recovered by darkening afterward.',
    purpose: 'Lightening a dim image can reveal details. Too much can hide them again.',
    parameter: {
      label: 'Brightness',
      min: -120,
      max: 120,
      step: 1,
      initial: 20,
      unit: '',
    },
  }),
  define({
    type: 'blur',
    beginnerName: 'Soften',
    technicalName: 'Gaussian blur',
    description: 'Smooth out small details.',
    simpleExplanation: 'Small details become softer and less noticeable.',
    detailedExplanation:
      'Each pixel blends with nearby pixels. Small specks fade into their surroundings. Too much softening can also hide the outlines you want to keep.',
    technicalExplanation:
      'A Gaussian kernel assigns weights proportional to exp(−distance² / (2σ²)). We normalize the weights to sum to 1, then apply a horizontal and a vertical pass to each RGB channel. Radius = ceil(3σ); border pixels are repeated. Softness controls σ. Preparing an image for another step is called preprocessing.',
    purpose: 'Softening can remove distracting specks before a computer looks for outlines.',
    parameter: { label: 'Softness', min: 0.5, max: 4, step: 0.5, initial: 1.5, unit: '' },
  }),
  define({
    type: 'threshold',
    beginnerName: 'Black & white',
    technicalName: 'Binary thresholding',
    description: 'Separate lighter parts from darker parts.',
    simpleExplanation: 'Lighter pixels turn white. Darker pixels turn black.',
    detailedExplanation:
      'The slider sets a dividing line between light and dark. Pixels at or above it turn white; the rest turn black. Move it until an object stands out from its background.',
    technicalExplanation:
      'First calculate rounded grayscale intensity. If intensity ≥ threshold, output 255; otherwise output 0. All three RGB channels receive the same value. A single threshold works best with a contrasting background. Separating an object this way is a simple form of segmentation.',
    purpose: 'Separating an object from its background makes its shape easier to find or count.',
    parameter: {
      label: 'Light / dark split',
      min: 0,
      max: 255,
      step: 1,
      initial: 128,
      unit: '',
    },
  }),
  define({
    type: 'edges',
    beginnerName: 'Find edges',
    technicalName: 'Sobel edge detection',
    description: 'Show the outlines of shapes.',
    simpleExplanation: 'Outlines become bright lines. Areas with little change become dark.',
    detailedExplanation:
      'The computer compares nearby pixels. A sharp change in brightness becomes a bright line. Small specks can make extra lines too, so try softening first.',
    technicalExplanation:
      'Convert RGB to intensity, then apply the 3×3 Sobel kernels Gx = [−1,0,1; −2,0,2; −1,0,1] and Gy = [−1,−2,−1; 0,0,0; 1,2,1]. Output = clamp(round(√(Gx² + Gy²) × sensitivity / 4), 0, 255). Border pixels are repeated.',
    purpose: 'Outlines help a computer find shapes without needing every detail of the image.',
    parameter: { label: 'Edge strength', min: 0.5, max: 3, step: 0.25, initial: 1, unit: '' },
  }),
];
export const operationByType = Object.fromEntries(operations.map((o) => [o.type, o])) as Record<
  OperationType,
  OperationDefinition
>;
