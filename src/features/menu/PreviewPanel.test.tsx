import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sections } from '../../content/sections';
import { renderInRouter as render } from '../../test/renderWithRouter';
import { PreviewPanel } from './PreviewPanel';

describe('PreviewPanel', () => {
  it.each(sections.map((s) => [s.label, s] as const))(
    '%s shows its preview copy and an enter link',
    (_, section) => {
      const { kicker, headline, blurb, highlights, ctaLabel } = section.preview;
      render(<PreviewPanel section={section} />);

      expect(screen.getByRole('heading', { level: 2, name: headline })).toBeInTheDocument();
      expect(screen.getByText(kicker)).toBeInTheDocument();
      expect(screen.getByText(blurb)).toBeInTheDocument();
      expect(screen.getByText(highlights.join(' · '))).toBeInTheDocument();

      const cta = screen.getByRole('link', { name: ctaLabel });
      expect(cta.getAttribute('href')).toMatch(new RegExp(`${section.route}$`));
    },
  );

  it('gives the blurb the id it is asked for, so the menu can point at it', () => {
    const section = sections[1]!;
    render(<PreviewPanel section={section} blurbId="preview-blurb" />);
    expect(screen.getByText(section.preview.blurb)).toHaveAttribute('id', 'preview-blurb');
  });
});
