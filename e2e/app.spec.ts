import { addStep, stepOptions, viewOptions, imageChoices } from './helpers';
import { expect, test } from '@playwright/test';

test('a beginner transforms an image, inspects a pixel, and understands why', async ({ page }) => {
  await page.goto('/');
  await imageChoices(page);
  await expect(page.getByRole('button', { name: 'Upload image', exact: true })).toBeVisible();
  await expect(page.getByLabel('Processing status')).toContainText('Ready');
  await addStep(page, 'Remove color');
  await addStep(page, 'Soften');
  await addStep(page, 'Find edges');
  await expect(page.getByLabel('Processing status')).toContainText('Ready');

  const canvas = page.getByRole('img', {
    name: 'After processing. Click or tap to inspect a pixel.',
  });
  await canvas.click();
  await expect(page.getByTestId('pixel-after')).toBeVisible();
  const values = await page.getByTestId('pixel-after').getAttribute('data-rgb');
  const channels = values!.split(',');
  expect(channels[0]).toBe(channels[1]);
  expect(channels[1]).toBe(channels[2]);
  await stepOptions(page, 'Find edges');
  await page.getByRole('button', { name: 'Move up: Find edges' }).click();
  await expect(page.locator('[data-step-type]').nth(1)).toHaveAttribute('data-step-type', 'edges');
  await page.getByRole('button', { name: 'Why it works' }).click();
  await expect(page.getByText('Why use this?', { exact: true })).toBeVisible();
  await page.getByText('Look inside', { exact: true }).click();
  await expect(page.getByText('In code, this is called', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(page.locator('[data-step-type]')).toHaveCount(0);
});

test('individual steps can be disabled, adjusted, deleted, and compared', async ({ page }) => {
  await page.goto('/');
  await addStep(page, 'Adjust brightness');
  await page.getByRole('slider', { name: 'Brightness' }).fill('80');
  await stepOptions(page, 'Adjust brightness');
  await page.getByRole('checkbox', { name: 'Use this step: Adjust brightness' }).uncheck();
  await expect(
    page.getByRole('checkbox', { name: 'Use this step: Adjust brightness' }),
  ).not.toBeChecked();
  await stepOptions(page, 'Adjust brightness');
  await page.getByRole('checkbox', { name: 'Use this step: Adjust brightness' }).check();
  await stepOptions(page, 'Adjust brightness');
  await page.getByRole('button', { name: 'Compare this step', exact: true }).click();
  await expect(page.getByLabel('Compare images')).toHaveValue('step');
  await viewOptions(page);
  await page.getByRole('button', { name: 'Slider', exact: true }).click();
  await page.getByRole('slider', { name: 'Before and after comparison' }).fill('30');
  await stepOptions(page, 'Adjust brightness');
  await page.getByRole('button', { name: 'Remove step: Adjust brightness' }).click();
  await expect(page.locator('[data-step-type]')).toHaveCount(0);
});

test('challenges encourage experimentation before hints', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Challenges', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Try a challenge' })).toBeVisible();
  await page.getByRole('button', { name: 'Try Make it gray' }).click();
  await expect(page.getByRole('button', { name: 'Give me a hint' })).toBeDisabled();
  await addStep(page, 'Remove color');
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
    page.getByText('Each step uses the result of the one before it.', { exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Try both orders', exact: true }).click();
  await expect(
    page.getByText('Each step uses the result of the one before it.', { exact: true }),
  ).toBeVisible();
});
