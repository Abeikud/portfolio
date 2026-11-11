import { describe, expect, it } from 'vitest';
import type { MenuKeyEvent } from '../features/menu/menuKeys';
import { isBackKey } from './screenKeys';

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

describe('isBackKey', () => {
  it.each(['Escape', 'Backspace'])('%s means back', (key) => {
    expect(isBackKey(press(key))).toBe(true);
  });

  it.each(['Enter', 'ArrowLeft', 'b', 'Delete'])('%s does not', (key) => {
    expect(isBackKey(press(key))).toBe(false);
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'] as const)('ignores %s combinations', (modifier) => {
    expect(isBackKey(press('Backspace', { [modifier]: true }))).toBe(false);
  });

  it('ignores Backspace and Escape while typing in a field', () => {
    const input = document.createElement('input');
    expect(isBackKey(press('Backspace', { target: input }))).toBe(false);
    expect(isBackKey(press('Escape', { target: input }))).toBe(false);
  });

  it('ignores keys during IME composition and auto-repeat', () => {
    expect(isBackKey(press('Escape', { isComposing: true }))).toBe(false);
    expect(isBackKey(press('Backspace', { repeat: true }))).toBe(false);
  });
});
