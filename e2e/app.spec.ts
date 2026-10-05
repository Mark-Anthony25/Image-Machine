import { expect, test } from '@playwright/test';

test('a beginner transforms an image, inspects a pixel, and understands why', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Upload image', exact: true })).toBeVisible();
  await expect(page.getByLabel('Processing status')).toContainText('Ready to experiment');
  await page.getByRole('button', { name: 'Add Remove Color', exact: true }).click();
  await page.getByRole('button', { name: 'Add Soften', exact: true }).click();
  await page.getByRole('button', { name: 'Add Find Edges', exact: true }).click();
  await expect(page.getByLabel('Processing status')).toContainText('Ready to experiment');
  await expect(
    page.getByText('You built an image-processing pipeline.', { exact: true }),
  ).toBeVisible();
  const canvas = page.getByRole('img', {
    name: 'After processing. Click or tap to inspect a pixel.',
  });
  await canvas.click({ position: { x: 150, y: 100 } });
  await expect(page.getByTestId('pixel-after')).toBeVisible();
  const values = await page.getByTestId('pixel-after').getAttribute('data-rgb');
  const channels = values!.split(',');
  expect(channels[0]).toBe(channels[1]);
  expect(channels[1]).toBe(channels[2]);
  await page.getByRole('button', { name: 'Move Find Edges up' }).click();
  await expect(page.locator('[data-step-type]').nth(1)).toHaveAttribute('data-step-type', 'edges');
  await page.getByRole('button', { name: 'Why did this happen?' }).click();
  await expect(page.getByText('Why would a computer do this?', { exact: true })).toBeVisible();
  await page.getByText('Look inside', { exact: true }).click();
  await expect(page.getByText('Technical name', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset recipe', exact: true }).click();
  await expect(page.locator('[data-step-type]')).toHaveCount(0);
});

test('individual steps can be disabled, adjusted, deleted, and compared', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Brightness', exact: true }).click();
  await page.getByRole('slider', { name: 'Brightness adjustment' }).fill('80');
  await page.getByRole('checkbox', { name: 'Enable Brightness' }).uncheck();
  await expect(page.getByRole('checkbox', { name: 'Enable Brightness' })).not.toBeChecked();
  await page.getByRole('checkbox', { name: 'Enable Brightness' }).check();
  await page.getByRole('button', { name: 'Inspect Brightness step' }).click();
  await expect(page.getByLabel('Comparison scope')).toHaveValue('step');
  await page.getByRole('button', { name: 'Slider', exact: true }).click();
  await page.getByRole('slider', { name: 'Before and after comparison' }).fill('30');
  await page.getByRole('button', { name: 'Delete Brightness' }).click();
  await expect(page.locator('[data-step-type]')).toHaveCount(0);
});

test('challenges encourage experimentation before hints', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Challenges', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Four small discoveries.' })).toBeVisible();
  await page.getByRole('button', { name: 'Try Remove the Colors' }).click();
  await expect(page.getByRole('button', { name: 'Give me a hint' })).toBeDisabled();
  await page.getByRole('button', { name: 'Add Remove Color', exact: true }).click();
  await expect(page.getByTestId('challenge-feedback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Give me a hint' })).toBeEnabled();
});

test('order experiment asks first and then shows different pipelines', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Learn', exact: true }).click();
  await expect(
    page.getByText('Do you think these will look the same?', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Each step changes the information received by the next step.', { exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Try both orders', exact: true }).click();
  await expect(
    page.getByText('Each step changes the information received by the next step.', { exact: true }),
  ).toBeVisible();
});
