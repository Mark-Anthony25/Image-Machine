import { addStep, imageChoices, viewOptions } from './helpers';
import { expect, test } from '@playwright/test';

test('initial image loading reserves preview space and announces its state', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/samples/color-study.png', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toBeVisible();
  const loadingBox = (await page.locator('.preview').boundingBox())!;
  release();
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toHaveCount(0);
  const readyBox = (await page.locator('.preview').boundingBox())!;
  expect(Math.abs(readyBox.height - loadingBox.height)).toBeLessThan(50);
});

test('changing samples uses a skeleton and then shows the new pixels', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/samples/contrast.png', async (route) => {
    if (route.request().resourceType() === 'image') {
      await gate;
    }
    await route.continue();
  });
  await imageChoices(page);
  await page.getByRole('button', { name: 'Use sample Mug', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toBeVisible();
  release();
  await expect(page.locator('.preview-meta').getByText('Mug', { exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toHaveCount(0);
});

test('processing keeps the result in place and exposes an updating state', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (
      message: unknown,
      options?: StructuredSerializeOptions | Transferable[],
    ) {
      // Hold real work long enough to inspect the updating UI deterministically.
      const send = original.bind(this);
      window.setTimeout(() => {
        if (Array.isArray(options)) send(message, options);
        else send(message, options);
      }, 500);
    };
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await addStep(page, 'Soften');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  const before = (await page.locator('.preview').boundingBox())!;
  await page.getByRole('slider', { name: 'Softness' }).fill('4');
  await expect(page.getByLabel('Processing status')).toContainText('Updating');
  expect(
    await page.getByLabel('Processing status').evaluate((el) => !!el.closest('[aria-busy=true]')),
  ).toBe(false);
  await expect(page.locator('.split-preview')).toHaveAttribute('aria-busy', 'true');
  await expect(
    page.getByRole('img', { name: 'After processing. Click or tap to inspect a pixel.' }),
  ).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toHaveCount(0);
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  expect((await page.locator('.preview').boundingBox())!.height).toBe(before.height);
});

for (const mode of ['Slider', 'Result'] as const) {
  test(`${mode} keeps its preview dimensions while a new image loads`, async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Processing status')).toContainText('Ready');
    await viewOptions(page);
    await page.getByRole('button', { name: mode, exact: true }).click();
    const before = (await page.locator('.preview').boundingBox())!;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/samples/contrast.png', async (route) => {
      await gate;
      await route.continue();
    });
    await imageChoices(page);
    await page.getByRole('button', { name: 'Use sample Mug', exact: true }).click();
    const status = page.getByRole('status', { name: 'Loading image preview' });
    await expect(status).toBeVisible();
    expect(await status.evaluate((el) => !!el.closest('[aria-busy=true]'))).toBe(false);
    const loading = (await page.locator('.preview').boundingBox())!;
    expect(Math.abs(loading.height - before.height)).toBeLessThan(2);
    release();
    await expect(page.getByLabel('Processing status')).toContainText('Ready');
    expect(
      Math.abs((await page.locator('.preview').boundingBox())!.height - before.height),
    ).toBeLessThan(2);
  });
}

test('skeleton motion respects the reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/samples/color-study.png', () => {});
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('status', { name: 'Loading image preview' })).toBeVisible();
  expect(
    await page
      .locator('.skeleton-image')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none');
});

test('mobile learners can move between controls and results without hunting', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile workspace navigation');
  await page.goto('/');
  await addStep(page, 'Soften');
  await page.getByRole('link', { name: 'See preview', exact: true }).tap();
  await expect(page.getByRole('heading', { name: 'Preview', exact: true })).toBeInViewport();
  await page.getByRole('link', { name: 'Edit image & steps', exact: true }).tap();
  await expect(page.getByRole('heading', { name: 'Your image', exact: true })).toBeInViewport();
});
