import { expect, test, type Page } from '@playwright/test';

const desktopFrame = (page: Page) => page.frameLocator('[data-testid="frame-desktop"]');
const mobileFrame = (page: Page) => page.frameLocator('[data-testid="frame-mobile"]');

test.describe('desktop shell', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('shows desktop and phone frames side by side by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('frame-desktop')).toBeVisible();
    await expect(page.getByTestId('frame-mobile')).toBeVisible();
    await expect(desktopFrame(page).getByTestId('layout')).toHaveText('desktop');
    // The phone frame is a real 402px viewport, so the page's mobile CSS applies.
    await expect(mobileFrame(page).getByTestId('viewport-width')).toHaveText('402');
    await expect(mobileFrame(page).getByTestId('layout')).toHaveText('mobile');
    await expect(mobileFrame(page).getByRole('button', { name: 'Open menu' })).toBeVisible();
  });

  test('phone picker resizes the phone viewport', async ({ page }) => {
    await page.goto('/?view=mobile');
    await page.getByRole('combobox').selectOption('galaxy-s26');
    await expect(mobileFrame(page).getByTestId('viewport-width')).toHaveText('360');
    await page.getByRole('combobox').selectOption('iphone-17-pro-max');
    await expect(mobileFrame(page).getByTestId('viewport-width')).toHaveText('440');
    await expect(page).toHaveURL(/device=iphone-17-pro-max/);
  });

  test('tab changes stay in sync across frames and survive a library switch', async ({ page }) => {
    await page.goto('/');
    await desktopFrame(page).getByRole('tab', { name: 'Rivals' }).click();
    await expect(mobileFrame(page).getByTestId('tab-content')).toHaveAttribute('data-tab', 'rivals');
    await expect(page).toHaveURL(/tab=rivals/);

    await mobileFrame(page).getByRole('tab', { name: 'Laundering' }).click();
    await expect(desktopFrame(page).getByTestId('tab-content')).toHaveAttribute('data-tab', 'laundering');

    await page.getByRole('button', { name: 'MUI' }).click();
    await expect(page).toHaveURL(/lib=mui/);
    await expect(page.getByTestId('frame-desktop')).toHaveAttribute('src', /\/mui\/\?tab=laundering/);
    await expect(desktopFrame(page).getByTestId('tab-content')).toHaveAttribute('data-tab', 'laundering');
    await expect(mobileFrame(page).getByTestId('tab-content')).toHaveAttribute('data-tab', 'laundering');
  });

  test('viewport toggle switches between desktop, mobile and both', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Desktop', exact: true }).click();
    await expect(page.getByTestId('frame-mobile')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await page.getByRole('button', { name: 'Mobile', exact: true }).click();
    await expect(page.getByTestId('frame-desktop')).toHaveCount(0);
    await expect(page.getByTestId('frame-mobile')).toBeVisible();
  });
});

test.describe('shell on a real phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('shows only the mobile view, full width, without the toggle', async ({ page }) => {
    await page.goto('/?view=both');
    await expect(page.getByTestId('frame-desktop')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Both' })).toHaveCount(0);
    await expect(mobileFrame(page).getByTestId('layout')).toHaveText('mobile');
    const width = Number(await mobileFrame(page).getByTestId('viewport-width').textContent());
    expect(width).toBe(page.viewportSize()!.width);
  });

  test('page has no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
