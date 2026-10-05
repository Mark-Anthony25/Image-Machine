import { addStep, stepOptions, viewOptions } from './helpers';
import { expect, test } from '@playwright/test';

test('all navigation and comparison controls fit narrow screens at 200% text', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await expect(page.getByLabel('Processing status')).toContainText('Ready');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `Document width at ${width}`,
    ).toBeLessThanOrEqual(width + 1);
    await viewOptions(page);
    for (const name of [
      'Playground',
      'Learn',
      'Challenges',
      'About',
      'Side by side',
      'Slider',
      'Result',
    ]) {
      const button = page.getByRole('button', { name, exact: true });
      const box = (await button.boundingBox())!;
      expect(box.x, `${name} left edge at width ${width}`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${name} right edge at width ${width}`).toBeLessThanOrEqual(width);
      const visible = await button.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        for (let parent = el.parentElement; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          if (['hidden', 'clip'].includes(style.overflowX)) {
            const clip = parent.getBoundingClientRect();
            if (bounds.left < clip.left || bounds.right > clip.right) return false;
          }
        }
        return true;
      });
      expect(visible, `${name} must not be clipped`).toBe(true);
    }
  }
});

test('a disabled step explains that it leaves the pixels unchanged', async ({ page }) => {
  await page.goto('/');
  await addStep(page, 'Remove color');
  await stepOptions(page, 'Remove color');
  await page.getByRole('checkbox', { name: 'Use this step: Remove color' }).uncheck();
  await expect(
    page.getByText('This step is off, so it leaves the image unchanged.', { exact: true }),
  ).toBeVisible();
});
