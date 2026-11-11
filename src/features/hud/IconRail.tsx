import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import { resume } from '../../content/resume';
import { GitHubIcon, LinkedInIcon } from './icons';
import styles from './IconRail.module.css';

interface RailLink {
  label: string;
  href: string;
  icon: ReactNode;
  external: boolean;
}

const links: RailLink[] = [
  { label: 'GitHub', href: resume.contact.github, icon: <GitHubIcon />, external: true },
  { label: 'LinkedIn', href: resume.contact.linkedin, icon: <LinkedInIcon />, external: true },
  {
    label: 'Email',
    href: `mailto:${resume.contact.email}`,
    icon: <Mail aria-hidden="true" strokeWidth={2.25} />,
    external: false,
  },
];

/** The column of small round shortcuts beside the menu. */
export function IconRail({ className = '' }: { className?: string }) {
  return (
    <ul className={`${styles.rail} ${className}`} aria-label="Elsewhere">
      {links.map(({ label, href, icon, external }) => (
        <li key={label}>
          <a
            className={styles.link}
            href={href}
            aria-label={label}
            title={label}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
