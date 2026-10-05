import { expect, test } from '@playwright/test';

test('the opening screen gives one starting action and hides extra choices', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await expect(page.getByRole('button', { name: 'Add Remove color', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Soften', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload image', exact: true })).not.toBeVisible();
  await expect(page.getByLabel('Compare images')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pixel details', exact: true })).not.toBeVisible();
  await expect(page.getByText('Gaussian blur', { exact: true })).not.toBeVisible();
  await expect(page.locator('main button:visible')).toHaveCount(2);
});

test('adding a step closes the chooser and only the selected step shows its controls', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByText('Add a step', { exact: true }).click();
  await page.getByRole('button', { name: 'Add Soften', exact: true }).click();
  await expect(page.locator('.step-picker')).not.toHaveAttribute('open', '');
  await expect(page.getByRole('slider', { name: 'Softness' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect Soften step' })).toBeFocused();
  await page.getByText('Add a step', { exact: true }).click();
  await page.getByRole('button', { name: 'Add Adjust brightness', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Softness' })).not.toBeVisible();
  await expect(page.getByRole('slider', { name: 'Brightness' })).toBeVisible();
  await page.getByRole('button', { name: 'Inspect Soften step' }).click();
  await expect(page.getByRole('slider', { name: 'Softness' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Brightness' })).not.toBeVisible();
  await expect(page.getByLabel('Compare images')).toHaveValue('all');
});

test('numbers and technical names appear only when the learner asks', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Remove color', exact: true }).click();
  await page
    .getByRole('img', { name: 'After processing. Click or tap to inspect a pixel.' })
    .click();
  await expect(page.getByTestId('pixel-after')).toBeVisible();
  await expect(page.getByText('Grayscale conversion', { exact: true })).not.toBeVisible();
  await page.getByRole('button', { name: 'Why it works', exact: true }).click();
  await expect(page.getByText('Grayscale conversion', { exact: true })).not.toBeVisible();
  await page.getByText('Look inside', { exact: true }).click();
  await expect(page.getByText('Grayscale conversion', { exact: true })).toBeVisible();
});

test('starting over returns keyboard focus to the first action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Remove color', exact: true }).click();
  const reset = page.getByRole('button', { name: 'Start over', exact: true });
  await reset.focus();
  await reset.press('Enter');
  await expect(page.getByRole('button', { name: 'Add Remove color', exact: true })).toBeFocused();
});

test('step controls can collapse without changing the result or their settings', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByText('Add a step', { exact: true }).click();
  await page
    .locator('.step-picker')
    .getByRole('button', { name: 'Add Soften', exact: true })
    .click();
  await page.getByRole('slider', { name: 'Softness' }).fill('3');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  const canvas = page.getByRole('img', {
    name: 'After processing. Click or tap to inspect a pixel.',
  });
  const before = await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL());
  const title = page.getByRole('button', { name: 'Inspect Soften step', exact: true });
  await title.click();
  await expect(title).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('slider', { name: 'Softness' })).not.toBeVisible();
  expect(await canvas.evaluate((el) => (el as HTMLCanvasElement).toDataURL())).toBe(before);
  await title.click();
  await expect(page.getByRole('slider', { name: 'Softness' })).toHaveValue('3');
});
