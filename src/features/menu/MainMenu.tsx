import { useEffect, useEffectEvent, useId, useReducer, useRef } from 'react';
import { sections as defaultSections } from '../../content/sections';
import type { Section, SectionId } from '../../content/types';
import { IconRail } from '../hud/IconRail';
import { SceneBackground } from '../scene/SceneBackground';
import { BrandMark } from './BrandMark';
import { createMenuState, menuReducer } from './menuReducer';
import { MenuList } from './MenuList';
import { PreviewPanel } from './PreviewPanel';
import { useMenuKeyboard } from './useMenuKeyboard';
import styles from './MainMenu.module.css';

export interface MainMenuProps {
  sections?: Section[];
  onActivate?: (section: Section) => void;
  /** Section selected on mount (restores the selection after a screen). */
  initialSelectedId?: SectionId;
  onSelectionChange?: (section: Section) => void;
  /** Focus the selected item on mount, e.g. when returning from a screen. */
  autoFocusSelected?: boolean;
}

/** The home screen: stadium scene, brand, icon rail, section menu and preview. */
export function MainMenu({
  sections = defaultSections,
  onActivate,
  initialSelectedId,
  onSelectionChange,
  autoFocusSelected = false,
}: MainMenuProps) {
  const [state, dispatch] = useReducer(menuReducer, undefined, () =>
    createMenuState(
      sections.length,
      sections.findIndex((s) => s.id === initialSelectedId),
    ),
  );
  const blurbId = useId();
  const current = sections[state.selected];

  // Report selection changes (not the initial one) so the app can remember it.
  const reportSelection = useEffectEvent((index: number) => {
    const section = sections[index];
    if (section) onSelectionChange?.(section);
  });
  const lastReported = useRef(state.selected);
  useEffect(() => {
    if (lastReported.current === state.selected) return;
    lastReported.current = state.selected;
    reportSelection(state.selected);
  }, [state.selected]);

  const activate = (index: number) => {
    const section = sections[index];
    if (!section) return;
    dispatch({ type: 'select', index });
    onActivate?.(section);
  };

  useMenuKeyboard((intent) => {
    if (intent === 'activate') activate(state.selected);
    else dispatch({ type: intent });
  });

  return (
    <div className={styles.stage}>
      {current && <SceneBackground order={sections.map((s) => s.id)} activeId={current.id} />}
      <header className={styles.top}>
        <BrandMark />
      </header>
      <IconRail className={styles.rail} />
      <div className={styles.menu}>
        <MenuList
          items={sections}
          selected={state.selected}
          onSelect={(index) => dispatch({ type: 'select', index })}
          onActivate={activate}
          describedBy={blurbId}
          focusOnMount={autoFocusSelected}
        />
      </div>
      <div className={styles.preview}>
        {current && <PreviewPanel section={current} blurbId={blurbId} />}
      </div>
    </div>
  );
}
