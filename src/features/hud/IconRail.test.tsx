import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resume } from '../../content/resume';
import { IconRail } from './IconRail';

describe('IconRail', () => {
  it('links to GitHub and LinkedIn in a new tab, safely', () => {
    render(<IconRail />);

    for (const [name, href] of [
      ['GitHub', resume.contact.github],
      ['LinkedIn', resume.contact.linkedin],
    ] as const) {
      const link = screen.getByRole('link', { name });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('has an email link that opens the mail client', () => {
    render(<IconRail />);
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      `mailto:${resume.contact.email}`,
    );
  });

  it('groups the links under an accessible name', () => {
    render(<IconRail />);
    expect(screen.getByRole('list', { name: 'Elsewhere' })).toBeInTheDocument();
  });
});
