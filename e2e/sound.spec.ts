import { expect, test, type Page } from '@playwright/test';

// A spy in place of Web Audio: counts audio engines created and tones started,
// so the test can "hear" the menu without speakers.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown> & { __tones: number[] };
    w.__tones = [];
    w.__contexts = 0;
    const param = () => {
      const p = {
        value: 0,
        set: false,
        setValueAtTime(v: number) {
          if (!p.set) p.value = v;
          p.set = true;
          return p;
        },
        exponentialRampToValueAtTime: () => p,
        linearRampToValueAtTime: () => p,
      };
      return p;
    };
    class SpyAudioContext {
      state = 'running';
      currentTime = 0;
      destination = {};
      constructor() {
        (w.__contexts as number)++;
      }
      resume() {
        return Promise.resolve();
      }
      createGain() {
        return { gain: param(), connect: (n: unknown) => n };
      }
      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: param(),
          connect: (n: unknown) => n,
          start: () => w.__tones.push(osc.frequency.value),
          stop: () => {},
        };
        return osc;
      }
    }
    w.AudioContext = SpyAudioContext;
    w.webkitAudioContext = SpyAudioContext;
  });
});

const tones = (page: Page) =>
  page.evaluate(() => (window as unknown as { __tones: number[] }).__tones.length);
const contexts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __contexts: number }).__contexts);

test('menu sounds are off by default, and play once switched on', async ({ page, isMobile }) => {
  test.skip(isMobile, 'covered on desktop; touch uses the same cues');
  await page.goto('./');
  const menu = page.getByRole('navigation', { name: 'Main menu' });
  await expect(menu).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowUp');
  expect(await contexts(page)).toBe(0);
  expect(await tones(page)).toBe(0);

  // ← into the rail, open Settings, switch Menu sounds on.
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  const toggle = page.getByRole('switch', { name: 'Menu sounds' });
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowRight');

  const before = await tones(page);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => tones(page)).toBeGreaterThan(before);

  // Remembered on the next visit.
  await page.reload();
  await expect(menu).toBeVisible();
  const afterReload = await tones(page);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => tones(page)).toBeGreaterThan(afterReload);
});
