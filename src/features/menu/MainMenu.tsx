import type { Section } from '../../content/types';

export interface MainMenuProps {
  sections?: Section[];
  onActivate?: (section: Section) => void;
}

// Stub: implemented in the green step of Phase 3.
export function MainMenu(props: MainMenuProps) {
  void props;
  return null;
}
