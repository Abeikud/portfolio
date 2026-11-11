import { useReducer } from 'react';
import { sections as defaultSections } from '../../content/sections';
import type { Section } from '../../content/types';
import { IconRail } from '../hud/IconRail';
import { BrandMark } from './BrandMark';
import { createMenuState, menuReducer } from './menuReducer';
import { MenuList } from './MenuList';
import { useMenuKeyboard } from './useMenuKeyboard';
import styles from './MainMenu.module.css';

export interface MainMenuProps {
  sections?: Section[];
  onActivate?: (section: Section) => void;
}

/** The home screen: brand, icon rail and the big section menu over the scene. */
export function MainMenu({ sections = defaultSections, onActivate }: MainMenuProps) {
  const [state, dispatch] = useReducer(menuReducer, sections.length, createMenuState);

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
      <div className={styles.scene} aria-hidden="true" />
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
        />
      </div>
    </div>
  );
}
