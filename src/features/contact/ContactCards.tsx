import { FileText, Mail } from 'lucide-react';
import { Fragment, useRef, useState, type ReactNode } from 'react';
import type { Contact } from '../../content/types';
import { useGrid } from '../hub/useGrid';
import { GitHubIcon, LinkedInIcon } from '../hud/icons';
import styles from './ContactCards.module.css';

interface Card {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

/** Lets long addresses wrap after "@" and "/" instead of mid-word. */
const softBreaks = (value: string) =>
  value.split(/(?<=[@/])/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));

/** Strip the scheme and trailing slash for display: "github.com/Abeikud". */
const display = (url: string) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

/**
 * Big cards for each way to get in touch. Like the hub tiles, they're played
 * with the arrow keys (← → / A D, plus ↑ ↓ when they wrap onto two rows):
 * the selected card lights up and Enter opens it. Touch still taps.
 */
export function ContactCards({ contact }: { contact: Contact }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [picked, setPicked] = useState(0);
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

  const selected = Math.min(picked, cards.length - 1);
  useGrid({
    listRef,
    count: cards.length,
    selected,
    onSelect: setPicked,
    // A real click keeps each link's own behaviour (mail app, new tab…).
    onActivate: (index) => listRef.current?.querySelectorAll('a')[index]?.click(),
  });

  return (
    <ul ref={listRef} aria-label="Ways to reach me" className={styles.cards}>
      {cards.map((card, index) => (
        <li key={card.label} data-selected={index === selected}>
          <a
            className={styles.card}
            href={card.href}
            tabIndex={index === selected ? 0 : -1}
            {...(card.external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            <span className={styles.icon}>{card.icon}</span>
            <span className={styles.label}>{card.label}</span>
            <span className={styles.value}>{softBreaks(card.value)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
