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
    beginnerName: 'Remove Color',
    technicalName: 'Grayscale conversion',
    description: 'Keep the brightness. Leave the color behind.',
    simpleExplanation: 'The colors disappear. Each pixel keeps a brightness value.',
    detailedExplanation:
      'A color pixel contains red, green, and blue values. Grayscale combines them into one brightness value, also called intensity. Red, green, and blue become equal, so the pixel looks gray.',
    technicalExplanation:
      'Gray = round(0.299 × R + 0.587 × G + 0.114 × B). Each output channel receives this value. Green has the largest weight because human vision is especially sensitive to it.',
    purpose:
      'A computer may only need light and dark information to find a shape. Removing color simplifies the information it has to examine.',
    parameter: null,
  }),
  define({
    type: 'brightness',
    beginnerName: 'Brightness',
    technicalName: 'Intensity adjustment',
    description: 'Make every pixel brighter or darker.',
    simpleExplanation: 'Pixel values rise or fall, making the image lighter or darker.',
    detailedExplanation:
      'Each color channel is a number between 0 and 255. Adding the same amount to each channel raises brightness; subtracting lowers it. Values cannot go below 0 or above 255. When they hit a limit, detail can disappear. This is called clipping.',
    technicalExplanation:
      'Output channel = clamp(input channel + adjustment, 0, 255). For example, 240 + 30 becomes 255, not 270. Clipped information cannot be recovered by darkening afterward.',
    purpose:
      'Changing brightness can make dim information easier to see. Be careful: clipping can remove details that another processing step needs.',
    parameter: {
      label: 'Brightness adjustment',
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
    description: 'Let neighboring pixels blend together.',
    simpleExplanation: 'Small details soften as nearby pixel values are combined.',
    detailedExplanation:
      'Every pixel borrows a little information from its neighbors. Closer pixels matter more than distant ones. Small specks become less noticeable, but strong blur can also wash away useful boundaries.',
    technicalExplanation:
      'A Gaussian kernel assigns weights proportional to exp(−distance² / (2σ²)). We normalize the weights to sum to 1, then apply a horizontal and a vertical pass to each RGB channel. Radius = ceil(3σ); border pixels are repeated.',
    purpose:
      'Smoothing can reduce noise before finding edges. This prepares an image for the next step; it is often called preprocessing.',
    parameter: { label: 'Soften amount', min: 0.5, max: 4, step: 0.5, initial: 1.5, unit: ' σ' },
  }),
  define({
    type: 'threshold',
    beginnerName: 'Separate Light & Dark',
    technicalName: 'Binary thresholding',
    description: 'Turn brightness into a yes-or-no decision.',
    simpleExplanation: 'Pixels become black or white depending on their brightness.',
    detailedExplanation:
      'The threshold is a dividing line. Pixels at or above it become white; darker pixels become black. Moving the line changes which parts belong to each group. Separating an object from its background is a simple form of segmentation.',
    technicalExplanation:
      'First calculate rounded grayscale intensity. If intensity ≥ threshold, output 255; otherwise output 0. All three RGB channels receive the same value. A single threshold works best with a contrasting background.',
    purpose:
      'A computer can separate an object from its background and then examine its shape or count connected objects.',
    parameter: {
      label: 'Light / dark dividing line',
      min: 0,
      max: 255,
      step: 1,
      initial: 128,
      unit: '',
    },
  }),
  define({
    type: 'edges',
    beginnerName: 'Find Edges',
    technicalName: 'Sobel edge detection',
    description: 'Reveal places where brightness changes.',
    simpleExplanation: 'Strong changes between neighboring pixels become bright lines.',
    detailedExplanation:
      'A computer looks for sudden brightness differences, both across and down the image. Flat areas become dark; boundaries become bright. Texture and noise can also look like boundaries, which is why softening first can help.',
    technicalExplanation:
      'Convert RGB to intensity, then apply the 3×3 Sobel kernels Gx = [−1,0,1; −2,0,2; −1,0,1] and Gy = [−1,−2,−1; 0,0,0; 1,2,1]. Output = clamp(round(√(Gx² + Gy²) × sensitivity / 4), 0, 255). Border pixels are repeated.',
    purpose:
      'Boundaries contain useful clues about object shapes. Edge detection extracts information that later computer vision tasks can use.',
    parameter: { label: 'Edge sensitivity', min: 0.5, max: 3, step: 0.25, initial: 1, unit: '×' },
  }),
];
export const operationByType = Object.fromEntries(operations.map((o) => [o.type, o])) as Record<
  OperationType,
  OperationDefinition
>;
