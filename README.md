# Image Machine

**See how computers transform images.**

An interactive, browser-only introduction to image processing for students with no programming or mathematical prerequisites.

**See it → Try it → Understand it → Look inside**

Choose a sample, upload an image, or capture a camera frame. Add a few steps and watch the image change. Explore why computers remove color, adjust brightness, soften details, separate light and dark, and find boundaries.

## Features

- One clear first action, five focused image changes, and immediate previews.
- Image choices, step options, view settings, and pixel numbers appear when requested.
- Enable, disable, delete, and reorder steps; desktop dragging and keyboard/touch move buttons.
- Original/final and individual-step comparisons, side-by-side previews, a comparison slider, and a result view.
- Pixel inspection with matching input/output RGB values, intensity, a magnified neighborhood, and arrow-key navigation.
- Progressive explanations: a simple observation, why it happens and why it is useful, and an optional technical explanation.
- Four experiment-first challenges and a processing-order demonstration.
- Responsive layouts, visible focus states, semantic controls, and reduced-motion support.
- Four original educational sample images, included locally under the MIT license.

## Run locally

Requires **Node.js 22.12 or later** and npm. Node.js 24 LTS is recommended.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Camera capture requires HTTPS or localhost and browser permission.

## Verify

```sh
npm run check
npm test
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
```

Unit tests check exact pixel values, clipping, alpha preservation, Gaussian smoothing, Sobel boundaries, one-pixel images, pipeline order, input limits, and challenge feedback. Browser tests cover the complete student journey on desktop and mobile Chromium, input failures, resizing, fast parameter changes, keyboard inspection, camera denial and track cleanup, worker recovery, text enlargement, local-only network activity, and automated axe WCAG A/AA checks. Simulated browser/device checks do not replace classroom trials or physical-camera testing.

## Processing and architecture

There is no backend. React and TypeScript provide the interface; Canvas decodes and displays images; a Web Worker runs the pipeline without blocking controls.

```text
src/
  components/    Input, recipe, comparison, pixel inspector, lessons
  content/       Operation explanations, samples, challenges
  hooks/         Worker and request lifecycle
  lib/           Image validation, decode, and resize
  processing/    Pure algorithms, shared types, pipeline, worker
tests/           Numerical and content tests
e2e/             Browser interaction and accessibility checks
public/          Local samples and favicon
```

Each operation has a beginner name, technical name, parameter definition, explanations, purpose, and a pure processing function. To add an operation, extend `OperationType`, implement the pixel transformation, add its educational definition and icon, and test its numerical behavior. UI controls consume the definitions.

| Beginner action   | Technical process                                                           |
| ----------------- | --------------------------------------------------------------------------- |
| Remove color      | Rounded `0.299R + 0.587G + 0.114B` intensity                                |
| Adjust brightness | Add a value to each RGB channel and clamp to 0–255                          |
| Soften            | Normalized, separable Gaussian convolution; radius `ceil(3σ)`               |
| Black & white     | Rounded intensity at or above threshold becomes 255; otherwise 0            |
| Find edges        | Sobel gradients on intensity; magnitude × sensitivity / 4, clamped to 0–255 |

Convolution repeats pixels at image borders. Operations preserve alpha; input images are first composited onto white. Values are educational 8-bit image channels, not linear-light photometric measurements. Sobel is a basic edge detector; it is not Canny or an object-recognition model.

## Privacy and limits

- User images and camera frames are processed in browser memory. They are never uploaded, tracked, or stored by the application.
- There are no analytics, remote fonts, third-party runtime image requests, accounts, APIs, or persistent browser storage.
- Page hosting can still produce ordinary access logs for page/assets requests; image pixels are never sent in those requests.
- Images are resized to a maximum of **960 pixels on the longest side**, preserving aspect ratio. The working pixel coordinates refer to this resized image.
- Files are limited to **25 MB** and recipes to **12 steps** to keep processing practical on classroom devices.
- PNG, JPEG, WebP, GIF, AVIF, and BMP are accepted when the browser can decode them. Animated files use a decoded frame. SVG is not accepted.
- Transparent inputs are flattened onto white. Extreme compressed-image dimensions may still exceed a browser's native decoder limits; failures preserve the previous image and suggest another input.
- Challenges acknowledge useful patterns in the result; they do not grade arbitrary segmentation accuracy or substitute for observation.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Select the **Vite** preset, install with `npm ci`, build with `npm run build`, and use **dist** as the output directory.
3. Deploy. No environment variables, API keys, or backend services are required.

The included `vercel.json` sets the build/output configuration and security/privacy headers. A static HTTPS host that serves the `dist` directory also works. This repository does not require Vercel-specific runtime APIs.

## License

MIT. See [LICENSE](LICENSE). The bundled sample images are original educational specimens created for Image Machine and are covered by the same license. No third-party image attribution is required.
