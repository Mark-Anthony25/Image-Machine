import { addStep, imageChoices, inspectCenter } from './helpers';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the untouched input is explained truthfully', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Original image', exact: true })).toBeVisible();
  await expect(
    page.getByText('The colors disappear. Each pixel keeps a brightness value.', { exact: true }),
  ).not.toBeVisible();
});

test('the first mobile transformation is reachable immediately', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-specific first action');
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Add Remove color' });
  await expect(button).toBeInViewport();
  await button.tap();
  await expect(page.locator('[data-step-type=grayscale]')).toHaveCount(1);
});

test('unsupported and corrupt inputs explain recovery and preserve the source', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  const original = await page
    .locator('canvas')
    .first()
    .evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  await page.getByLabel('Image file').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.getByRole('alert')).toContainText('Choose a PNG');
  await page.getByLabel('Image file').setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('broken image'),
  });
  await expect(page.getByRole('alert')).toContainText('could not read');
  expect(
    await page
      .locator('canvas')
      .first()
      .evaluate((el) => (el as HTMLCanvasElement).toDataURL()),
  ).toBe(original);
});

test('large dimensions are resized and oversized files are rejected', async ({ page }) => {
  await page.goto('/');
  const encoded = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 5000;
    c.height = 2500;
    const x = c.getContext('2d')!;
    x.fillStyle = '#da5e3d';
    x.fillRect(0, 0, c.width, c.height);
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Image file').setInputFiles({
    name: 'large.png',
    mimeType: 'image/png',
    buffer: Buffer.from(encoded, 'base64'),
  });
  await expect(page.locator('.preview-meta')).toContainText('large.png');
  await expect(page.locator('canvas').first()).toHaveAttribute('width', '960');
  await expect(page.locator('canvas').first()).toHaveAttribute('height', '480');
  await page.getByLabel('Image file').setInputFiles({
    name: 'huge.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(26 * 1024 * 1024),
  });
  await expect(page.getByRole('alert')).toContainText('25 MB');
  await expect(page.locator('canvas').first()).toHaveAttribute('width', '960');
});

test('rapid slider edits settle on the newest pixel values', async ({ page }) => {
  await page.goto('/');
  await addStep(page, 'Adjust brightness');
  const range = page.getByRole('slider', { name: 'Brightness' });
  for (const v of ['-100', '80', '-50', '120']) await range.fill(v);
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await inspectCenter(page);
  const before = (await page.getByTestId('pixel-before').getAttribute('data-rgb'))!
    .split(',')
    .map(Number);
  const after = (await page.getByTestId('pixel-after').getAttribute('data-rgb'))!
    .split(',')
    .map(Number);
  expect(after).toEqual(before.map((v) => Math.min(255, v + 120)));
});

test('the pixel inspector supports keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByRole('img', {
    name: 'After processing. Click or tap to inspect a pixel.',
  });
  await canvas.focus();
  await canvas.press('Enter');
  await expect(page.getByText('X: 360 / Y: 240')).toBeVisible();
  await canvas.press('ArrowRight');
  await expect(page.getByText('X: 361 / Y: 240')).toBeVisible();
});

test('camera denial is actionable and the modal can close', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
      configurable: true,
    });
  });
  await page.goto('/');
  await imageChoices(page);
  await page.getByRole('button', { name: 'Use camera', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Allow camera access');
  await page.getByRole('button', { name: 'Close camera' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('camera tracks stop after capture and after cancellation', async ({ page }) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    Object.defineProperty(window, 'testCameraStreams', { value: streams });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: async () => {
          const c = document.createElement('canvas');
          c.width = 160;
          c.height = 120;
          const x = c.getContext('2d')!;
          x.fillStyle = '#da5e3d';
          x.fillRect(0, 0, 160, 120);
          const s = c.captureStream(10);
          streams.push(s);
          return s;
        },
      },
      configurable: true,
    });
  });
  await page.goto('/');
  await imageChoices(page);
  await page.getByRole('button', { name: 'Use camera', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Capture image' })).toBeEnabled();
  await page.getByRole('button', { name: 'Capture image' }).click();
  await expect(
    page.locator('.preview-meta').getByText('Camera image', { exact: true }),
  ).toBeVisible();
  await imageChoices(page);
  await page.getByRole('button', { name: 'Use camera', exact: true }).click();
  await page.getByRole('button', { name: 'Close camera' }).click();
  expect(
    await page.evaluate(() =>
      (window as unknown as { testCameraStreams: MediaStream[] }).testCameraStreams.every((s) =>
        s.getTracks().every((t) => t.readyState === 'ended'),
      ),
    ),
  ).toBe(true);
});

test('a failed worker can restart without losing the image', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeWorker = window.Worker;
    Object.defineProperty(window, 'allowTestWorker', { value: false, writable: true });
    window.Worker = new Proxy(NativeWorker, {
      construct(target, args) {
        if (!(window as unknown as { allowTestWorker: boolean }).allowTestWorker)
          throw new Error('unavailable');
        return Reflect.construct(target, args);
      },
    });
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('could not start');
  await page.evaluate(() => {
    (window as unknown as { allowTestWorker: boolean }).allowTestWorker = true;
  });
  await page.getByRole('button', { name: 'Try processing again' }).click();
  await addStep(page, 'Remove color');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('the interface remains usable at enlarged text and narrow widths', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  ).toBe(true);
  await addStep(page, 'Remove color');
  await expect(page.locator('[data-step-type=grayscale]')).toHaveCount(1);
});

test('the main views and expanded controls have no axe WCAG A/AA violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  for (const view of ['Playground', 'Learn', 'Challenges', 'About']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  }
  await page.getByRole('button', { name: 'Playground', exact: true }).click();
  await addStep(page, 'Soften');
  await page.getByRole('button', { name: 'Why it works' }).click();
  await page.getByText('Look inside', { exact: true }).click();
  await inspectCenter(page);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});

test('image processing never sends pixels or activity off the device', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET' || new URL(r.url()).origin !== 'http://127.0.0.1:5173')
      requests.push(r.method() + ' ' + r.url());
  });
  await page.goto('/');
  await addStep(page, 'Remove color');
  await addStep(page, 'Find edges');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  expect(requests).toEqual([]);
});
