// Screenshots every library page at phone (390px) and desktop (1280px)
// widths, and checks each layout is the right one: drawer button and cards
// on the phone, inline nav and a table on desktop. Images land in
// screenshots/, which CI uploads as an artifact.

import { expect, test } from '@playwright/test';
import { LIBRARIES } from '../packages/shared/src/contract';

const SIZES = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
] as const;

// Viewports are set per test, so run this file in one project only.
test.skip(({ isMobile }) => isMobile, 'runs once, in the desktop project');

for (const { id } of LIBRARIES) {
  for (const size of SIZES) {
    test(`${id} at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto(`/${id}/`);
      if (size.name === 'phone') {
        await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
        await expect(page.getByRole('list', { name: 'Crew' })).toBeVisible();
      } else {
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
      }
      await page.screenshot({ path: `screenshots/${id}-${size.width}.png`, fullPage: true });
      if (size.name !== 'phone') return;

      // The two overlays that most often break on phones: drawer and modal.
      await page.getByRole('button', { name: 'Open menu' }).click();
      await expect(page.getByRole('navigation', { name: 'Drawer' })).toBeVisible();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `screenshots/${id}-${size.width}-menu.png` });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('navigation', { name: 'Drawer' })).toBeHidden();

      await page.getByRole('button', { name: 'Expand territory' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `screenshots/${id}-${size.width}-modal.png` });
    });
  }
}
