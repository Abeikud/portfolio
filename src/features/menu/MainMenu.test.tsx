import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sections } from '../../content/sections';
import { MainMenu } from './MainMenu';

const menu = () => screen.getByRole('navigation', { name: 'Main menu' });
const items = () => within(menu()).getAllByRole('button');
const item = (label: string) => within(menu()).getByRole('button', { name: label });
const current = () => items().filter((b) => b.getAttribute('aria-current') === 'true');
const section = (id: string) => sections.find((s) => s.id === id);

describe('MainMenu', () => {
  it('shows the brand as the page heading', () => {
    render(<MainMenu />);
    expect(screen.getByRole('heading', { level: 1, name: 'Daniel Dampson' })).toBeInTheDocument();
  });

  it('lists the 7 sections as buttons inside a "Main menu" nav, in order', () => {
    render(<MainMenu />);
    expect(items().map((b) => b.textContent)).toEqual(sections.map((s) => s.label));
  });

  it('starts with the first item selected, and only that one', () => {
    render(<MainMenu />);
    expect(current()).toEqual([item('ABOUT')]);
  });

  it('moves the selection and focus with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(current()).toEqual([item('EXPERIENCE')]);
    expect(item('EXPERIENCE')).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(current()).toEqual([item('PROJECTS')]);
    expect(item('PROJECTS')).toHaveFocus();
  });

  it('keeps only the selected item in the tab order (roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    await user.keyboard('{End}');

    expect(items().map((b) => b.tabIndex)).toEqual([-1, -1, -1, -1, -1, -1, 0]);
  });

  it('exposes each item’s distance from the selection for the fade-out styling', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');

    expect(items().map((b) => b.closest('li')?.dataset.distance)).toEqual([
      '3',
      '2',
      '1',
      '0',
      '1',
      '2',
      '3',
    ]);
  });

  it('selects an item when the mouse hovers it', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    await user.hover(item('CONTACT'));

    expect(current()).toEqual([item('CONTACT')]);
  });

  it('does not select on touch pointer-over (a tap must not activate straight away)', () => {
    render(<MainMenu />);

    fireEvent.pointerOver(item('SKILLS'), { pointerType: 'touch' });

    expect(current()).toEqual([item('ABOUT')]);
  });

  it('activates the item under the mouse when clicked', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<MainMenu onActivate={onActivate} />);

    await user.click(item('SKILLS'));

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(section('skills'));
  });

  it('on touch, the first tap selects and the second tap activates', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<MainMenu onActivate={onActivate} />);

    await user.pointer({ keys: '[TouchA]', target: item('EDUCATION') });
    expect(current()).toEqual([item('EDUCATION')]);
    expect(onActivate).not.toHaveBeenCalled();

    await user.pointer({ keys: '[TouchA]', target: item('EDUCATION') });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(section('education'));
  });

  it('activates the selected item with Enter when nothing is focused', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<MainMenu onActivate={onActivate} />);

    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(section('about'));
  });

  it('activates exactly once when Enter is pressed on the focused item', async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<MainMenu onActivate={onActivate} />);

    await user.keyboard('{ArrowDown}');
    expect(item('PROJECTS')).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith(section('projects'));
  });

  it('renders the icon rail', () => {
    render(<MainMenu />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });
});
