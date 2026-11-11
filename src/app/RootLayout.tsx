import { Outlet } from 'react-router';
import { ScreenMemoryProvider } from './ScreenMemoryProvider';

export function RootLayout() {
  return (
    <ScreenMemoryProvider>
      <main className="app">
        <Outlet />
      </main>
    </ScreenMemoryProvider>
  );
}
