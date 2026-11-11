import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TabBar, type Tab } from './TabBar';

const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'macos', label: 'macOS' },
];

function Harness({ onChange = vi.fn() }: { onChange?: (id: string) => void }) {
  const [active, setActive] = useState('all');
  return (
    <>
      <TabBar
        label="Filter projects"
        tabs={tabs}
        active={active}
        idPrefix="t"
        onChange={(id) => {
          setActive(id);
          onChange(id);
        }}
      />
      <div id="t-panel">
        <a href="#one" tabIndex={-1}>
          One
        </a>
        <a href="#two" tabIndex={0}>
          Two
        </a>
      </div>
      <input aria-label="Notes" />
    </>
  );
}

const selected = () =>
  screen.getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true');

describe('TabBar', () => {
  it('renders a named tablist with the active tab selected', () => {
    render(<Harness />);

    expect(screen.getByRole('tablist', { name: 'Filter projects' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['All', 'Web', 'macOS']);
    expect(selected()).toHaveTextContent('All');
  });

  it('gives tabs predictable ids so a panel can point at the active one', () => {
    render(<Harness />);
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute('id', 't-tab-web');
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute('aria-controls', 't-panel');
  });

  it('switches on click', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('tab', { name: 'macOS' }));

    expect(selected()).toHaveTextContent('macOS');
  });

  it('switches with Q / E from anywhere, wrapping like shoulder buttons', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.keyboard('e');
    expect(selected()).toHaveTextContent('Web');
    await user.keyboard('ee');
    expect(selected()).toHaveTextContent('All');
    await user.keyboard('q');
    expect(selected()).toHaveTextContent('macOS');
  });

  it('switches with ← / → when a tab has focus, moving focus along', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('tab', { name: 'All' }).focus();

    await user.keyboard('{ArrowRight}');

    expect(selected()).toHaveTextContent('Web');
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveFocus();
  });

  it('↓ from a tab drops focus onto the panel’s current item', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole('tab', { name: 'All' }).focus();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('link', { name: 'Two' })).toHaveFocus();
  });

  it('keeps only the active tab in the tab order', () => {
    render(<Harness />);
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });

  it('ignores Q / E while typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'queue');

    expect(onChange).not.toHaveBeenCalled();
  });
});
