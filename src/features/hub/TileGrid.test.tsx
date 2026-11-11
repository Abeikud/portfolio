import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { TileGrid, type TileItem } from './TileGrid';

const items: TileItem[] = ['a', 'b', 'c', 'd', 'e'].map((key) => ({
  key,
  to: `/things/${key}`,
  label: `Thing ${key.toUpperCase()}`,
  children: <span>{key}</span>,
}));

function Harness(props: {
  onSelect?: (key: string) => void;
  focusOnMount?: boolean;
  start?: string;
}) {
  const [selectedKey, setSelectedKey] = useState(props.start);
  return (
    <TileGrid
      label="Things"
      items={items}
      columns={3}
      selectedKey={selectedKey}
      focusOnMount={props.focusOnMount}
      onSelect={(key) => {
        setSelectedKey(key);
        props.onSelect?.(key);
      }}
    />
  );
}

function renderGrid(props: Parameters<typeof Harness>[0] = {}) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <Harness {...props} /> },
      { path: '/things/:id', element: <h1>Opened</h1> },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const tile = (name: string) =>
  within(screen.getByRole('list', { name: 'Things' })).getByRole('link', { name });
const selectedTile = () =>
  within(screen.getByRole('list', { name: 'Things' }))
    .getAllByRole('link')
    .find((link) => link.closest('li')?.dataset.selected === 'true');

describe('TileGrid', () => {
  it('lists every item as a link in a named list, first one selected', () => {
    renderGrid();

    expect(
      within(screen.getByRole('list', { name: 'Things' }))
        .getAllByRole('link')
        .map((l) => l.getAttribute('href')),
    ).toEqual(['/things/a', '/things/b', '/things/c', '/things/d', '/things/e']);
    expect(selectedTile()).toBe(tile('Thing A'));
  });

  it('moves in two dimensions with the arrow keys, focus following', async () => {
    const user = userEvent.setup();
    renderGrid();

    await user.keyboard('{ArrowRight}{ArrowDown}');

    expect(selectedTile()).toBe(tile('Thing E'));
    expect(tile('Thing E')).toHaveFocus();
  });

  it('keeps only the selected tile in the tab order', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.keyboard('{ArrowRight}');

    expect(tile('Thing B').tabIndex).toBe(0);
    expect(tile('Thing A').tabIndex).toBe(-1);
  });

  it('reports selection changes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderGrid({ onSelect });

    await user.keyboard('{ArrowDown}');

    expect(onSelect).toHaveBeenLastCalledWith('d');
  });

  it('selects a tile on mouse hover', async () => {
    const user = userEvent.setup();
    renderGrid();

    await user.hover(tile('Thing C'));

    expect(selectedTile()).toBe(tile('Thing C'));
  });

  it('opens the selected tile with Enter even when focus is elsewhere', async () => {
    const user = userEvent.setup();
    const router = renderGrid({ start: 'c' });

    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Opened' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/things/c');
  });

  it('can restore focus to the selected tile on mount', () => {
    renderGrid({ start: 'b', focusOnMount: true });
    expect(tile('Thing B')).toHaveFocus();
  });

  it('falls back to the first tile when the remembered one is gone', () => {
    renderGrid({ start: 'zzz' });
    expect(selectedTile()).toBe(tile('Thing A'));
  });
});
