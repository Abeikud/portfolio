import { expect, test, type Page } from '@playwright/test';

// A fake standard-mapping controller: Playwright can't plug in a real one, so
// navigator.getGamepads() is replaced before the page loads and tests press
// its buttons through window.__pad.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const IDX = { a: 0, b: 1, lb: 4, rb: 5, up: 12, down: 13, left: 14, right: 15 } as const;
    const buttons = Array.from({ length: 17 }, () => ({
      pressed: false,
      touched: false,
      value: 0,
    }));
    const pad = {
      id: 'Test controller (STANDARD GAMEPAD)',
      index: 0,
      connected: true,
      mapping: 'standard',
      timestamp: 0,
      axes: [0, 0, 0, 0],
      buttons,
    };
    let plugged = false;
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => (plugged ? [pad, null, null, null] : [null, null, null, null]),
    });
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    Object.assign(window, {
      __pad: {
        connect() {
          plugged = true;
          window.dispatchEvent(new Event('gamepadconnected'));
        },
        async press(name: keyof typeof IDX) {
          buttons[IDX[name]] = { pressed: true, touched: true, value: 1 };
          await wait(100);
          buttons[IDX[name]] = { pressed: false, touched: false, value: 0 };
          await wait(100);
        },
      },
    });
  });
});

type PadButton = 'a' | 'b' | 'lb' | 'rb' | 'up' | 'down' | 'left' | 'right';
const press = (page: Page, name: PadButton) =>
  page.evaluate(
    (button) =>
      (window as unknown as { __pad: { press: (b: string) => Promise<void> } }).__pad.press(button),
    name,
  );
const connect = (page: Page) =>
  page.evaluate(() => (window as unknown as { __pad: { connect: () => void } }).__pad.connect());

test.skip(({ isMobile }) => isMobile, 'controllers are a desktop feature here');

test('the whole site can be played with a controller', async ({ page }) => {
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main menu' });
  const controls = page.getByRole('group', { name: 'Controls' });
  await expect(menu).toBeVisible();

  await connect(page);
  await expect(page.getByRole('status', { name: 'Controller connected' })).toBeVisible();

  // D-pad down: ABOUT → PROJECTS, and the prompts switch to controller buttons.
  await press(page, 'down');
  await expect(menu.getByRole('button', { name: 'PROJECTS' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(controls.getByText('A', { exact: true })).toBeVisible();

  // A opens Projects; RB switches tab; B goes back with PROJECTS still selected.
  await press(page, 'a');
  await expect(page).toHaveURL(/:\d+\/projects$/);
  const tabs = page.getByRole('tablist');
  const firstTab = tabs.getByRole('tab').first();
  await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  await press(page, 'rb');
  await expect(firstTab).toHaveAttribute('aria-selected', 'false');
  await expect(controls.getByRole('button', { name: /back/i })).toContainText('B');

  // Move along the tiles, open one, and back out.
  await press(page, 'right');
  await press(page, 'a');
  await expect(page).toHaveURL(/:\d+\/projects\/[\w-]+$/);
  await press(page, 'b');
  await expect(page).toHaveURL(/:\d+\/projects$/);
  await press(page, 'b');
  await expect(page).toHaveURL(/:\d+\/$/);
  await expect(menu.getByRole('button', { name: 'PROJECTS' })).toHaveAttribute(
    'aria-current',
    'true',
  );

  // ← into the icon rail, A opens Settings, B closes it.
  await press(page, 'left');
  const gear = page.getByRole('button', { name: 'Settings' });
  await expect(gear).toBeFocused();
  await press(page, 'a');
  await expect(gear).toHaveAttribute('aria-expanded', 'true');
  await press(page, 'b');
  await expect(gear).toHaveAttribute('aria-expanded', 'false');

  // Touching the keyboard brings the keyboard prompts back.
  await page.keyboard.press('ArrowRight');
  await expect(controls.getByText('⏎').first()).toBeVisible();
});
