import { Outlet } from 'react-router';
import { TopHud } from '../features/hud/TopHud';
import { PlayerProvider } from './PlayerProvider';
import { ScreenMemoryProvider } from './ScreenMemoryProvider';

export function RootLayout() {
  return (
    <PlayerProvider>
      <ScreenMemoryProvider>
        <main className="app">
          <Outlet />
        </main>
        <TopHud />
      </ScreenMemoryProvider>
    </PlayerProvider>
  );
}
