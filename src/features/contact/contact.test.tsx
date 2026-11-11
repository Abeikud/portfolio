import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
