import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resume } from '../../content/resume';
import { renderApp } from '../../test/renderWithRouter';

describe('Education screen', () => {
  it('shows the school, degree and minor', () => {
    renderApp('/education');
    const { school, degree, minor } = resume.education;

    expect(screen.getByRole('heading', { level: 1, name: 'EDUCATION' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: school })).toBeInTheDocument();
    expect(screen.getByText(degree)).toBeInTheDocument();
    expect(screen.getByText(`Minor in ${minor}`)).toBeInTheDocument();
  });

  it('lists every course exactly once', () => {
    renderApp('/education');
    const courses = within(screen.getByRole('list', { name: 'Coursework' }))
      .getAllByRole('listitem')
      .map((li) => li.textContent);

    expect(courses).toEqual(resume.education.coursework);
    for (const course of resume.education.coursework) {
      expect(screen.getAllByText(course)).toHaveLength(1);
    }
  });
});

describe('Certifications screen', () => {
  it('shows every certification exactly once, with its issuer', () => {
    renderApp('/certifications');
    const cabinet = screen.getByRole('list', { name: 'Certifications' });
    const items = within(cabinet).getAllByRole('listitem');

    expect(items).toHaveLength(resume.certifications.length);
    resume.certifications.forEach((cert, i) => {
      expect(within(items[i]!).getByRole('heading', { level: 2, name: cert.name })).toBeVisible();
      expect(within(items[i]!).getByText(cert.issuer)).toBeInTheDocument();
      expect(screen.getAllByText(cert.name)).toHaveLength(1);
    });
  });
});
