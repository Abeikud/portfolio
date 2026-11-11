import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { installMatchMedia, resetMediaQueries } from './matchMedia';

installMatchMedia();

// Vitest globals are off, so RTL can't register its own auto-cleanup.
afterEach(() => {
  cleanup();
  resetMediaQueries();
});
