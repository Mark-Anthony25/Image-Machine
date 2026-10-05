import type { Page } from '@playwright/test';

async function openDetails(page: Page, selector: string) {
  const details = page.locator(selector);
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open)))
    await details.locator('summary').first().click();
}
export async function addStep(page: Page, name: string) {
  const first = page.locator('.first-step button');
  if (name === 'Remove color' && (await first.isVisible())) {
    await first.click();
    return;
  }
  await openDetails(page, '.step-picker');
  await page
    .locator('.step-picker')
    .getByRole('button', { name: `Add ${name}`, exact: true })
    .click();
}
export async function stepOptions(page: Page, name: string) {
  const step = page
    .locator('[data-step-type]')
    .filter({ has: page.getByRole('button', { name: `Inspect ${name} step`, exact: true }) });
  const title = step.locator('.step-title');
  if ((await title.getAttribute('aria-expanded')) !== 'true') await title.click();
  const details = step.locator('.step-options');
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open)))
    await details.locator('summary').click();
}
export async function imageChoices(page: Page) {
  await openDetails(page, '.source-picker');
}
export async function viewOptions(page: Page) {
  await openDetails(page, '.view-options');
}
export async function inspectCenter(page: Page) {
  await openDetails(page, '.pixel-details');
  await page.getByRole('button', { name: 'Inspect the center pixel', exact: true }).click();
}
