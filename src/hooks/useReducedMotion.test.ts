import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { setMediaQuery } from '../test/matchMedia';
import { REDUCED_MOTION_QUERY, useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  it('is false when the OS has no preference', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('is true when the OS asks for reduced motion', () => {
    setMediaQuery(REDUCED_MOTION_QUERY, true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('follows the preference when it changes', () => {
    const { result } = renderHook(() => useReducedMotion());

    act(() => setMediaQuery(REDUCED_MOTION_QUERY, true));
    expect(result.current).toBe(true);

    act(() => setMediaQuery(REDUCED_MOTION_QUERY, false));
    expect(result.current).toBe(false);
  });
});
