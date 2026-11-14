// Shell behavior. Checks run inside the frames through the browser, not
// through page-specific markup, so they hold for every library page.

import { expect, test, type Frame, type Page } from '@playwright/test';

async function frame(page: Page, which: 'desktop' | 'mobile'): Promise<Frame> {
  const handle = await page.getByTestId(`frame-${which}`).elementHandle();
  const f = await handle!.contentFrame();
  await f!.waitForLoadState();
  return f!;
}

const innerWidth = (f: Frame) => f.evaluate(() => window.innerWidth);
const isMobileLayout = (f: Frame) => f.evaluate(() => window.matchMedia('(max-width: 639px)').matches);
const selectedTab = (page: Page, which: 'desktop' | 'mobile') =>
  page
    .frameLocator(`[data-testid="frame-${which}"]`)
    .getByRole('tab', { selected: true })
    .filter({ visible: true });

test.describe('desktop shell', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('shows desktop and phone frames side by side by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('frame-desktop')).toBeVisible();
    await expect(page.getByTestId('frame-mobile')).toBeVisible();
    expect(await isMobileLayout(await frame(page, 'desktop'))).toBe(false);
    // The phone frame is a real 402px viewport, so the page's mobile CSS applies.
    const phone = await frame(page, 'mobile');
    expect(await innerWidth(phone)).toBe(402);
    expect(await isMobileLayout(phone)).toBe(true);
  });

  test('phone picker resizes the phone viewport', async ({ page }) => {
    await page.goto('/?view=mobile');
    await page.getByRole('combobox', { name: 'Phone' }).selectOption('galaxy-s26');
    await expect.poll(async () => innerWidth(await frame(page, 'mobile'))).toBe(360);
    await page.getByRole('combobox', { name: 'Phone' }).selectOption('iphone-17-pro-max');
    await expect.poll(async () => innerWidth(await frame(page, 'mobile'))).toBe(440);
    await expect(page).toHaveURL(/device=iphone-17-pro-max/);
  });

  test('tab changes stay in sync across frames and survive a library switch', async ({ page }) => {
    await page.goto('/');
    await page.frameLocator('[data-testid="frame-desktop"]').getByRole('tab', { name: 'Rivals' }).click();
    await expect(selectedTab(page, 'mobile')).toHaveText('Rivals');
    await expect(page).toHaveURL(/tab=rivals/);

    await page.frameLocator('[data-testid="frame-mobile"]').getByRole('tab', { name: 'Laundering' }).click();
    await expect(selectedTab(page, 'desktop')).toHaveText('Laundering');

    await page.getByRole('button', { name: 'MUI' }).click();
    await expect(page).toHaveURL(/lib=mui/);
    await expect(page.getByTestId('frame-desktop')).toHaveAttribute('src', /\/mui\/\?tab=laundering/);
    await expect(selectedTab(page, 'desktop')).toHaveText('Laundering');
    await expect(selectedTab(page, 'mobile')).toHaveText('Laundering');
  });

  test('viewport toggle switches between desktop, mobile and both', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Desktop', exact: true }).click();
    await expect(page.getByTestId('frame-mobile')).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Phone' })).toHaveCount(0);
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
    const phone = await frame(page, 'mobile');
    expect(await isMobileLayout(phone)).toBe(true);
    expect(await innerWidth(phone)).toBe(page.viewportSize()!.width);
  });

  test('page has no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('floating menu on a real phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone only');

  test('the page fills the screen and the menu switches library', async ({ page }) => {
    await page.goto('/?lib=shadcn');
    const frameBox = (await page.getByTestId('frame-mobile').boundingBox())!;
    expect(frameBox.y).toBe(0);
    expect(frameBox.height).toBe(page.viewportSize()!.height);

    const fab = page.getByRole('button', { name: 'Kingpin OS menu' });
    const fabBox = (await fab.boundingBox())!;
    expect(fabBox.height).toBe(44);
    // Docked on the right edge, partly off screen.
    expect(fabBox.x + fabBox.width).toBeGreaterThan(page.viewportSize()!.width);

    await fab.click();
    const menu = page.getByRole('dialog', { name: 'Kingpin OS menu' });
    await expect(menu.getByTestId('badges')).toContainText('lines of code');
    await expect(menu.getByRole('link', { name: 'Open shadcn/ui on its own' })).toHaveAttribute(
      'href',
      /\/shadcn\/\?tab=operations$/,
    );
    await menu.getByRole('button', { name: 'HeroUI', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/lib=heroui/);
    await expect(page.getByTestId('frame-mobile')).toHaveAttribute('src', /\/heroui\//);
  });

  test('the tab drags to the other edge and stays there', async ({ page }) => {
    await page.goto('/');
    const fab = page.getByRole('button', { name: 'Kingpin OS menu' });
    const box = (await fab.boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + 22);
    await page.mouse.down();
    await page.mouse.move(200, 300, { steps: 5 });
    await page.mouse.move(40, 150, { steps: 5 });
    await page.mouse.up();
    await expect(fab).toHaveAttribute('data-side', 'left');
    await expect(page.getByRole('dialog')).toHaveCount(0); // a drag is not a tap
    const moved = (await fab.boundingBox())!;
    expect(moved.x).toBeLessThan(0);
    expect(Math.abs(moved.y - 128)).toBeLessThan(30);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Kingpin OS menu' })).toHaveAttribute('data-side', 'left');
  });
});

test.describe('stats badges', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('show build-time numbers for every library', async ({ page, request }) => {
    const stats = await (await request.get('/stats.json')).json();
    const names: Record<string, string> = {
      shadcn: 'shadcn/ui', mui: 'MUI', mantine: 'Mantine', chakra: 'Chakra UI', daisyui: 'DaisyUI', heroui: 'HeroUI', custom: 'No library',
    };
    await page.goto('/');
    for (const [id, name] of Object.entries(names)) {
      const lib = stats.libraries[id];
      expect(lib.jsGzip, id).toBeGreaterThan(0);
      expect(lib.handBuilt + lib.fromLibrary, id).toBe(12);

      await page.getByRole('button', { name, exact: true }).click();
      const badges = page.getByTestId('badges');
      await expect(badges).toContainText(`${(lib.jsGzip / 1024).toFixed(1)} KB`);
      await expect(badges).toContainText(`${lib.linesOfCode.toLocaleString('en-US')} lines of code`);
      await expect(badges).toContainText(`${lib.fromLibrary} from library`);
    }
  });
});
