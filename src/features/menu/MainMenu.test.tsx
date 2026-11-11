import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { sections } from '../../content/sections';
import { renderInRouter as render } from '../../test/renderWithRouter';
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

  it('ignores mouse movement: hovering never changes the selection', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    await user.hover(item('CONTACT'));
    fireEvent.pointerOver(item('SKILLS'), { pointerType: 'mouse' });

    expect(current()).toEqual([item('ABOUT')]);
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

  it('previews the selected section, and the preview follows the selection', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    const [about, projects] = sections;

    expect(
      screen.getByRole('heading', { level: 2, name: about!.preview.headline }),
    ).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(
      screen.getByRole('heading', { level: 2, name: projects!.preview.headline }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: about!.preview.headline })).toBeNull();
  });

  it('describes the selected item with its preview blurb for screen readers', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);

    expect(item('ABOUT')).toHaveAccessibleDescription(section('about')!.preview.blurb);

    await user.keyboard('{ArrowDown}');

    expect(item('PROJECTS')).toHaveAccessibleDescription(section('projects')!.preview.blurb);
    expect(item('ABOUT')).not.toHaveAttribute('aria-describedby');
  });

  it('switches the background scene with the selection', async () => {
    const user = userEvent.setup();
    const { container } = render(<MainMenu />);

    await user.keyboard('{ArrowDown}{ArrowDown}');

    expect(container.querySelector<HTMLElement>('[data-active="true"]')?.dataset.scene).toBe(
      'experience',
    );
  });

  it('can start on a given section (restoring the selection)', () => {
    render(<MainMenu initialSelectedId="skills" />);
    expect(current()).toEqual([item('SKILLS')]);
  });

  it('reports every selection change', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<MainMenu onSelectionChange={onSelectionChange} />);

    await user.keyboard('{ArrowDown}');

    expect(onSelectionChange).toHaveBeenLastCalledWith(section('projects'));
  });

  it('focuses the selected item on mount when returning from a screen', () => {
    render(<MainMenu initialSelectedId="education" autoFocusSelected />);
    expect(item('EDUCATION')).toHaveFocus();
  });

  it('leaves focus alone on a normal first load', () => {
    render(<MainMenu />);
    expect(document.body).toHaveFocus();
  });

  it('← moves focus into the icon rail; ↑ / ↓ move within it', async () => {
    const user = userEvent.setup();
    render(<MainMenu />);
    const rail = within(screen.getByRole('list', { name: 'Elsewhere' }));

    await user.keyboard('{ArrowLeft}');
    expect(rail.getByRole('link', { name: 'GitHub' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(rail.getByRole('link', { name: 'LinkedIn' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(rail.getByRole('link', { name: 'GitHub' })).toHaveFocus();

    // Moving inside the rail leaves the menu selection alone.
    expect(current()).toEqual([item('ABOUT')]);
  });

  it.each(['{ArrowRight}', '{Escape}'])(
    '%s leaves the rail, back to the selected item',
    async (key) => {
      const user = userEvent.setup();
      render(<MainMenu />);
      await user.keyboard('{ArrowDown}{ArrowLeft}');

      await user.keyboard(key);

      expect(item('PROJECTS')).toHaveFocus();
    },
  );

  it('renders the icon rail', () => {
    render(<MainMenu />);
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });
});
