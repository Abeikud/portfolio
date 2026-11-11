import { Mail } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { resume } from '../../content/resume';
import { GitHubIcon, LinkedInIcon } from './icons';
import { RAIL_ITEM } from './railItem';
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
export function IconRail({
  className = '',
  leading,
  onExit,
}: {
  className?: string;
  /** Extra control at the top of the rail (the settings gear). */
  leading?: ReactNode;
  /** Called when the user leaves the rail with → or Esc. */
  onExit?: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  // ↑ / ↓ move between the rail's controls; → or Esc go back to the menu.
  // Handled keys are marked defaultPrevented so the menu leaves them alone.
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (!target.hasAttribute(RAIL_ITEM) || event.altKey || event.ctrlKey || event.metaKey) return;
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>(`[${RAIL_ITEM}]`) ?? [])];
    const index = items.indexOf(target);
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (key === 'ArrowDown' || key === 's') items[Math.min(index + 1, items.length - 1)]?.focus();
    else if (key === 'ArrowUp' || key === 'w') items[Math.max(index - 1, 0)]?.focus();
    else if (key === 'ArrowLeft' || key === 'a') {
      // Already at the edge: swallow it so the menu doesn't re-enter the rail.
    } else if (key === 'ArrowRight' || key === 'd' || key === 'Escape') {
      // An open settings panel owns Escape (it closes itself first).
      if (key === 'Escape' && target.getAttribute('aria-expanded') === 'true') return;
      onExit?.();
    } else return;
    event.preventDefault();
  });

  useEffect(() => {
    const list = listRef.current;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    list?.addEventListener('keydown', listener);
    return () => list?.removeEventListener('keydown', listener);
  }, []);

  return (
    <ul ref={listRef} className={`${styles.rail} ${className}`} aria-label="Elsewhere">
      {leading && <li>{leading}</li>}
      {links.map(({ label, href, icon, external }) => (
        <li key={label}>
          <a
            className={styles.link}
            href={href}
            aria-label={label}
            title={label}
            {...{ [RAIL_ITEM]: '' }}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
