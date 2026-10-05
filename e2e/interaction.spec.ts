import { addStep, imageChoices, viewOptions } from './helpers';
import { expect, test } from '@playwright/test';

test('desktop dragging changes the recipe order', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop drag interaction');
  await page.goto('/');
  await addStep(page, 'Soften');
  await addStep(page, 'Find edges');
  await page.locator('[data-step-type=edges]').dragTo(page.locator('[data-step-type=blur]'));
  await expect(page.locator('[data-step-type]').first()).toHaveAttribute('data-step-type', 'edges');
});

test('touch works for inspection, parameter adjustment, and comparison', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Actual touch interaction');
  await page.goto('/');
  await addStep(page, 'Adjust brightness');
  const control = page.getByRole('slider', { name: 'Brightness' });
  await control.scrollIntoViewIfNeeded();
  const box = (await control.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
  expect(Number(await control.inputValue())).toBeGreaterThan(20);
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await page.getByRole('img', { name: 'After processing. Click or tap to inspect a pixel.' }).tap();
  await expect(page.getByTestId('pixel-after')).toBeVisible();
  await viewOptions(page);
  await page.getByRole('button', { name: 'Slider', exact: true }).tap();
  const comparison = page.getByRole('slider', { name: 'Before and after comparison' });
  await comparison.scrollIntoViewIfNeeded();
  const bounds = (await comparison.boundingBox())!;
  await page.touchscreen.tap(bounds.x + bounds.width * 0.25, bounds.y + bounds.height / 2);
  expect(Number(await comparison.inputValue())).toBeLessThan(50);
});

test('tablet and laptop widths do not overflow', async ({ page }) => {
  await page.goto('/');
  await addStep(page, 'Black & white');
  for (const width of [640, 768, 820, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      `Width ${width}`,
    ).toBe(true);
    await expect(page.getByRole('slider', { name: 'Light / dark split' })).toBeVisible();
  }
});

test('closing the camera while permission is pending stops a late stream', async ({ page }) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    Object.defineProperty(window, 'lateCameraStreams', { value: streams });
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: () =>
          new Promise<MediaStream>((resolve) =>
            setTimeout(() => {
              const c = document.createElement('canvas');
              c.width = 2;
              c.height = 2;
              const s = c.captureStream();
              streams.push(s);
              resolve(s);
            }, 200),
          ),
      },
      configurable: true,
    });
  });
  await page.goto('/');
  await imageChoices(page);
  await page.getByRole('button', { name: 'Use camera', exact: true }).click();
  await page.getByRole('button', { name: 'Close camera' }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const streams = (window as unknown as { lateCameraStreams: MediaStream[] })
          .lateCameraStreams;
        return (
          streams.length > 0 &&
          streams.every((s) => s.getTracks().every((t) => t.readyState === 'ended'))
        );
      }),
    )
    .toBe(true);
});
