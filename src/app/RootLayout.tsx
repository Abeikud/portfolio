import { Outlet } from 'react-router';
import { TopHud } from '../features/hud/TopHud';
import { useNavigationCues } from '../features/sound/useNavigationCues';
import { PlayerProvider } from './PlayerProvider';
import { ScreenMemoryProvider } from './ScreenMemoryProvider';

export function RootLayout() {
  useNavigationCues();
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
