import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/routes';

/** Renders the whole app (real route table) in memory, starting at `path`. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { ...render(<RouterProvider router={router} />), router };
}

/** Renders a single component that uses router hooks/links. */
export function renderInRouter(ui: ReactElement, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}
