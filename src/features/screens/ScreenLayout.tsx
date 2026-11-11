import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMenuSelection } from '../../app/menuSelectionContext';
import { usePlayer } from '../../app/playerContext';
import { useBackKey } from '../../app/useBackKey';
import type { SectionId } from '../../content/types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { KeyPrompts } from '../hud/KeyPrompts';
import type { Prompt } from '../hud/prompts';
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
  /** Control hints shown after the Back prompt. */
  prompts?: readonly Prompt[];
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
  prompts = [],
  children,
}: ScreenLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { setSelectedId, markScreenVisit } = useMenuSelection();
  const { markVisited } = usePlayer();

  useDocumentTitle(documentTitle);

  // Move focus to the title so keyboard and screen-reader users start here.
  const focusHeading = useEffectEvent(() => {
    if (focusTitle) headingRef.current?.focus({ preventScroll: true });
  });
  useEffect(() => focusHeading(), [location.pathname]);

  // Keep the menu in sync (deep links included) and flag the coming return.
  useEffect(() => {
    if (sectionId) {
      setSelectedId(sectionId);
      markVisited(sectionId);
    }
    markScreenVisit();
  }, [sectionId, setSelectedId, markScreenVisit, markVisited]);

  const back = () => {
    // Reached by an in-app link (from the menu, a hub, the About news…): pop
    // history so Back returns there and the browser's Back/Forward stay sane.
    // Deep link: there's nothing of ours behind us, so replace with the parent.
    if ((location.state as FromState | null)?.from) navigate(-1);
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

      <footer className={styles.footer}>
        <KeyPrompts prompts={prompts} onBack={back} />
      </footer>
    </div>
  );
}
