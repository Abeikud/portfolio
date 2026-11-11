import { describe, expect, it } from 'vitest';
import { keyToIntent, type MenuIntent, type MenuKeyEvent } from './menuKeys';

const press = (key: string, overrides: Partial<MenuKeyEvent> = {}): MenuKeyEvent => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  repeat: false,
  isComposing: false,
  target: document.body,
  ...overrides,
});

const el = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host.firstElementChild as HTMLElement;
};

describe('keyToIntent', () => {
  it.each<[string, MenuIntent]>([
    ['ArrowDown', 'next'],
    ['s', 'next'],
    ['S', 'next'],
    ['ArrowUp', 'prev'],
    ['w', 'prev'],
    ['W', 'prev'],
    ['Home', 'first'],
    ['End', 'last'],
    ['Enter', 'activate'],
    [' ', 'activate'],
    ['ArrowLeft', 'rail'],
    ['a', 'rail'],
  ])('maps %j to %s', (key, intent) => {
    expect(keyToIntent(press(key))).toBe(intent);
  });

  it.each(['x', 'Tab', 'Escape', 'ArrowRight', 'Shift'])('ignores %j', (key) => {
    expect(keyToIntent(press(key))).toBeNull();
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'] as const)(
    'ignores keys pressed with %s (browser/OS shortcuts)',
    (modifier) => {
      expect(keyToIntent(press('ArrowDown', { [modifier]: true }))).toBeNull();
      expect(keyToIntent(press('Enter', { [modifier]: true }))).toBeNull();
    },
  );

  it('ignores keys something else already handled (e.g. the icon rail)', () => {
    expect(keyToIntent({ ...press('ArrowDown'), defaultPrevented: true })).toBeNull();
  });

  it('ignores keys while an IME is composing', () => {
    expect(keyToIntent(press('Enter', { isComposing: true }))).toBeNull();
  });

  it.each([
    '<input type="text" />',
    '<textarea></textarea>',
    '<select><option>a</option></select>',
    '<div contenteditable="true"></div>',
  ])('ignores every key while typing in %s', (html) => {
    const target = el(html);
    for (const key of ['ArrowDown', 'w', 's', 'Home', 'Enter', ' ']) {
      expect(keyToIntent(press(key, { target }))).toBeNull();
    }
  });

  it.each(['<button>Go</button>', '<a href="/x">Go</a>'])(
    'on %s: arrows still navigate, but Enter/Space are left to the native click',
    (html) => {
      const target = el(html);
      expect(keyToIntent(press('ArrowDown', { target }))).toBe('next');
      expect(keyToIntent(press('Enter', { target }))).toBeNull();
      expect(keyToIntent(press(' ', { target }))).toBeNull();
    },
  );

  it('lets held arrows auto-repeat but never repeats activate', () => {
    expect(keyToIntent(press('ArrowDown', { repeat: true }))).toBe('next');
    expect(keyToIntent(press('Enter', { repeat: true }))).toBeNull();
  });
});
