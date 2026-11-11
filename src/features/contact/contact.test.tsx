import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resume } from '../../content/resume';
import { sections } from '../../content/sections';
import { renderApp } from '../../test/renderWithRouter';
import { ContactCards } from './ContactCards';

const PHONE = /\+?\(?\d(?:[\s().-]*\d){9,}/;

describe('Contact screen', () => {
  it('links to email, LinkedIn and GitHub', () => {
    renderApp('/contact');
    const { email, linkedin, github } = resume.contact;

    expect(screen.getByRole('heading', { level: 1, name: 'CONTACT' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Email/ })).toHaveAttribute('href', `mailto:${email}`);
    for (const [name, href] of [
      [/LinkedIn/, linkedin],
      [/GitHub/, github],
    ] as const) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('shows the email address itself, so it can be copied', () => {
    renderApp('/contact');
    expect(screen.getByText(resume.contact.email)).toBeInTheDocument();
  });

  it('links the real resume PDF from the Contact screen', () => {
    renderApp('/contact');
    const link = screen.getByRole('link', { name: /resume/i });
    expect(link.getAttribute('href')).toMatch(/DDAMPSON_RESUME\.pdf$/);
  });

  it('hides the resume card until a PDF is configured', () => {
    render(<ContactCards contact={{ ...resume.contact, resumePdf: undefined }} />);
    expect(screen.queryByRole('link', { name: /resume/i })).toBeNull();
  });

  it('opens the resume PDF in a new tab instead of downloading it', () => {
    render(<ContactCards contact={{ ...resume.contact, resumePdf: 'resume.pdf' }} />);
    const link = screen.getByRole('link', { name: /resume/i });

    expect(link.getAttribute('href')).toMatch(/resume\.pdf$/);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).not.toHaveAttribute('download');
  });
});

describe('Contact cards with the arrow keys', () => {
  afterEach(() => vi.restoreAllMocks());

  const cards = () => within(screen.getByRole('list', { name: 'Ways to reach me' }));
  const card = (name: RegExp) => cards().getByRole('link', { name });
  const isSelected = (el: HTMLElement) => el.closest('li')?.dataset.selected === 'true';

  it('starts on the first card, with only the selected card in the Tab order', () => {
    renderApp('/contact');

    expect(isSelected(card(/Email/))).toBe(true);
    expect(
      cards()
        .getAllByRole('link')
        .map((a) => a.tabIndex),
    ).toEqual([0, -1, -1, -1]);
  });

  it('← / → (and A / D) move between the cards, focus following', async () => {
    const user = userEvent.setup();
    renderApp('/contact');

    await user.keyboard('{ArrowRight}');
    expect(card(/LinkedIn/)).toHaveFocus();
    expect(isSelected(card(/LinkedIn/))).toBe(true);

    await user.keyboard('dd');
    expect(card(/Resume/)).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(card(/GitHub/)).toHaveFocus();
  });

  it('Enter opens the selected card, even while focus is still on the title', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderApp('/contact');
    expect(screen.getByRole('heading', { level: 1, name: 'CONTACT' })).toHaveFocus();

    await user.keyboard('{ArrowRight}{ArrowRight}');
    screen.getByRole('heading', { level: 1, name: 'CONTACT' }).focus();
    await user.keyboard('{Enter}');

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.contexts[0]).toBe(card(/GitHub/));
  });

  it('shows Move and Open in the controls', () => {
    renderApp('/contact');
    const controls = within(screen.getByRole('group', { name: 'Controls' }));
    expect(controls.getByText('Move')).toBeInTheDocument();
    expect(controls.getByText('Open')).toBeInTheDocument();
  });
});

describe('privacy', () => {
  it.each([
    '/',
    ...sections.map((s) => s.route),
    '/projects/startingfive',
    '/experience/upei-teaching-assistant',
  ])('no phone number is rendered on %s', (path) => {
    renderApp(path);
    expect(document.body.textContent).not.toMatch(PHONE);
  });
});
