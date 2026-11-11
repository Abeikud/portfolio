import { FileText, Mail } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Contact } from '../../content/types';
import { GitHubIcon, LinkedInIcon } from '../hud/icons';
import styles from './ContactCards.module.css';

interface Card {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

/** Strip the scheme and trailing slash for display: "github.com/Abeikud". */
const display = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Big tappable cards for each way to get in touch. */
export function ContactCards({ contact }: { contact: Contact }) {
  const cards: Card[] = [
    {
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: <Mail aria-hidden="true" />,
    },
    {
      label: 'LinkedIn',
      value: display(contact.linkedin),
      href: contact.linkedin,
      icon: <LinkedInIcon />,
      external: true,
    },
    {
      label: 'GitHub',
      value: display(contact.github),
      href: contact.github,
      icon: <GitHubIcon />,
      external: true,
    },
  ];
  if (contact.resumePdf) {
    cards.push({
      label: 'Resume',
      value: 'Open PDF',
      href: `${import.meta.env.BASE_URL}${contact.resumePdf}`,
      icon: <FileText aria-hidden="true" />,
      // Opens in the browser's PDF viewer in a new tab (no download).
      external: true,
    });
  }

  return (
    <ul aria-label="Ways to reach me" className={styles.cards}>
      {cards.map((card) => (
        <li key={card.label}>
          <a
            className={styles.card}
            href={card.href}
            {...(card.external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <span className={styles.icon}>{card.icon}</span>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.value}>{card.value}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
