// Behavior every library page must share. Add a library id to LIBS once its
// kit replaces the stand-in, and the same tests run against it.

import { expect, test, type Locator, type Page } from '@playwright/test';

const LIBS = ['shadcn', 'mui', 'mantine'] as const;

async function pickOption(page: Page, label: string, option: string) {
  // Some libraries label their listbox too, so target the combobox itself.
  const field = page.getByRole('combobox', { name: label, exact: true });
  if ((await field.evaluate((el) => el.tagName)) === 'SELECT') {
    await field.selectOption({ label: option });
  } else {
    await field.click();
    await page.getByRole('option', { name: option }).click();
  }
}

const stats = (page: Page) => page.getByRole('region', { name: 'Key numbers' });
const visibleText = (page: Page, text: string) => page.getByText(text).filter({ visible: true }).first();

async function firstCellTexts(table: Locator) {
  return table.locator('tbody tr').locator('td:first-child').allTextContents();
}

for (const lib of LIBS) {
  test.describe(`${lib} page`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${lib}/`);
    });

    test('shows the four stat cards with seed values', async ({ page }) => {
      await expect(stats(page).getByText('KB$88,700')).toBeVisible();
      await expect(stats(page).getByText('Active Corners')).toBeVisible();
      await expect(stats(page).getByText('Crew Headcount')).toBeVisible();
      await expect(stats(page).getByText('82%')).toBeVisible();
    });

    test('recruit form validates, then adds the lieutenant', async ({ page }) => {
      await page.getByRole('button', { name: 'Recruit', exact: true }).click();
      await expect(page.getByText('Every lieutenant needs a codename.')).toBeVisible();
      await expect(page.getByText('An alibi is required. Obviously.')).toBeVisible();

      await page.getByLabel('Codename').fill('Waffles Wallace');
      await pickOption(page, 'Territory', 'Waffle Iron District');
      await pickOption(page, 'Product line', 'Smuggled Croissants (KP-SMC-002)');
      await page.getByLabel('Alibi').fill('Too short');
      await page.getByRole('button', { name: 'Recruit', exact: true }).click();
      await expect(page.getByText(/too thin/i)).toBeVisible();

      await page.getByLabel('Alibi').fill('I was at the knitting circle all night, ask anyone.');
      await page.getByRole('button', { name: 'Recruit', exact: true }).click();
      await expect(page.getByText('Lieutenant recruited')).toBeVisible();
      await expect(visibleText(page, 'Waffles Wallace')).toBeVisible();
      await expect(stats(page).getByText('37', { exact: true })).toBeVisible();
    });

    test('confirming expansion raises the heat and warns', async ({ page }) => {
      await page.getByRole('button', { name: 'Expand territory' }).click();
      const dialog = page.getByRole('dialog', { name: 'Confirm Territory Expansion' });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Expand', exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByText('Heat level rising')).toBeVisible();
      await expect(stats(page).getByText('88%')).toBeVisible();
    });

    test('cancelling the modal changes nothing', async ({ page }) => {
      await page.getByRole('button', { name: 'Expand territory' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(stats(page).getByText('82%')).toBeVisible();
    });

    test('check shipments shows the warning toast', async ({ page }) => {
      await page.getByRole('button', { name: 'Check shipments' }).click();
      await expect(page.getByText('Shipment delayed, blame the Feds')).toBeVisible();
    });

    test('tabs switch tables and keep ?tab= in the URL', async ({ page }) => {
      await page.getByRole('tab', { name: 'Rivals' }).click();
      await expect(visibleText(page, 'The Pastry Syndicate')).toBeVisible();
      await expect(page).toHaveURL(/tab=rivals/);
      await page.getByRole('tab', { name: 'Laundering' }).click();
      await expect(visibleText(page, 'Squeaky Clean Car Wash')).toBeVisible();
    });

    test.describe('desktop', () => {
      test.skip(({ isMobile }) => isMobile, 'desktop only');

      test('crew table sorts by column, both directions', async ({ page }) => {
        const table = page.getByRole('table');
        await page.getByRole('button', { name: /^Codename/ }).click();
        const asc = await firstCellTexts(table);
        expect(asc[0]).toBe('Benny Backdoor');
        expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)));
        await page.getByRole('button', { name: /^Codename/ }).click();
        expect((await firstCellTexts(table))[0]).toBe('Wobbly Wanda');
      });

      test('nav is inline, not a drawer', async ({ page }) => {
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
      });
    });

    test.describe('mobile', () => {
      test.skip(({ isMobile }) => !isMobile, 'phone only');

      test('nav becomes a drawer', async ({ page }) => {
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
        await page.getByRole('button', { name: 'Open menu' }).click();
        await expect(page.getByRole('navigation', { name: 'Drawer' })).toBeVisible();
      });

      test('table becomes stacked cards', async ({ page }) => {
        await expect(page.getByRole('table')).toBeHidden();
        await expect(page.getByRole('list', { name: 'Crew' }).getByRole('listitem')).toHaveCount(40);
      });

      test('touch targets are at least 44px and nothing scrolls sideways', async ({ page }) => {
        const small = await page.evaluate(() =>
          [...document.querySelectorAll('button, a, [role=tab], [role=combobox], input, textarea, select')]
            .filter((el) => (el as HTMLElement).offsetParent !== null && !el.closest('[aria-hidden="true"]'))
            .map((el) => ({ name: el.textContent?.trim() || el.id, h: el.getBoundingClientRect().height }))
            .filter((t) => t.h < 44),
        );
        expect(small).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    });
  });
}
