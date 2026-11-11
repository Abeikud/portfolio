import { ChevronLeft } from 'lucide-react';
import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMenuSelection } from '../../app/menuSelectionContext';
import { useBackKey } from '../../app/useBackKey';
import type { SectionId } from '../../content/types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SceneBackground } from '../scene/SceneBackground';
import styles from './ScreenLayout.module.css';

export interface ScreenLayoutProps {
  /** Big uppercase screen title (the page's h1). */
  title: string;
  /** Last breadcrumb, in title case. */
  crumb: string;
  documentTitle: string;
  /** The menu section this screen belongs to; the menu re-selects it on return. */
  sectionId?: SectionId;
  /** Background scene; defaults to the section's own. */
  scene?: SectionId;
  /** Where Back goes. */
  backTo?: string;
  /** Crumbs between "Main menu" and this screen. */
  trail?: readonly { label: string; to: string }[];
  /** Focus the title on arrival (off when the screen restores focus itself). */
  focusTitle?: boolean;
  /** One-line intro under the title. */
  intro?: string;
  children: ReactNode;
}

interface FromState {
  from?: string;
}

/**
 * Shared frame for every content screen: dimmed scene, breadcrumb, big title,
 * content, and a console-style "Esc Back" prompt. Esc/Backspace go back.
 */
export function ScreenLayout({
  title,
  crumb,
  documentTitle,
  sectionId,
  scene = sectionId,
  backTo = '/',
  trail = [],
  focusTitle = true,
  intro,
  children,
}: ScreenLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setSelectedId, markScreenVisit } = useMenuSelection();

  useDocumentTitle(documentTitle);

  // Move focus to the title so keyboard and screen-reader users start here.
  const focusHeading = useEffectEvent(() => {
    if (focusTitle) headingRef.current?.focus({ preventScroll: true });
  });
  useEffect(() => focusHeading(), [location.pathname]);

  // Keep the menu in sync (deep links included) and flag the coming return.
  useEffect(() => {
    if (sectionId) setSelectedId(sectionId);
    markScreenVisit();
  }, [sectionId, setSelectedId, markScreenVisit]);

  const back = () => {
    // Came from the parent inside the app: pop history, so the browser's own
    // Back/Forward stay meaningful. Deep link: replace this entry instead.
    if ((location.state as FromState | null)?.from === backTo) navigate(-1);
    else navigate(backTo, { replace: true, viewTransition: true });
  };
  useBackKey(back);

  return (
    <div className={styles.stage}>
      {scene && <SceneBackground order={[scene]} activeId={scene} dim />}

      <header className={styles.header}>
        <nav aria-label="Breadcrumb">
          <ol className={styles.crumbs}>
            <li>
              <Link to="/" viewTransition>
                Main menu
              </Link>
            </li>
            {trail.map((step) => (
              <li key={step.to}>
                <Link to={step.to} viewTransition>
                  {step.label}
                </Link>
              </li>
            ))}
            <li>
              <span aria-current="page">{crumb}</span>
            </li>
          </ol>
        </nav>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
          {title}
        </h1>
        {intro && <p className={styles.intro}>{intro}</p>}
      </header>

      <div className={styles.content}>{children}</div>

      <footer className={styles.prompts}>
        <button type="button" className={styles.prompt} onClick={back}>
          <kbd className={styles.key}>Esc</kbd>
          <ChevronLeft className={styles.chevron} aria-hidden="true" />
          Back
        </button>
      </footer>
    </div>
  );
}
