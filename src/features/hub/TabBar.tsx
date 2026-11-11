export interface Tab {
  id: string;
  label: string;
}

export interface TabBarProps {
  label: string;
  tabs: readonly Tab[];
  active: string;
  onChange: (id: string) => void;
  /** Prefix for tab/panel DOM ids so a panel can reference the active tab. */
  idPrefix: string;
}

// Stub: implemented in the green step of Phase 6.
export function TabBar(props: TabBarProps) {
  void props;
  return null;
}
