import { Outlet } from 'react-router';
import { MenuSelectionProvider } from './MenuSelectionProvider';

export function RootLayout() {
  return (
    <MenuSelectionProvider>
      <main className="app">
        <Outlet />
      </main>
    </MenuSelectionProvider>
  );
}
