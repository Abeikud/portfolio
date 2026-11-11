import { Outlet } from 'react-router';
import { useGamepadBridge } from '../features/gamepad/useGamepadBridge';
import { TopHud } from '../features/hud/TopHud';
import { PlayerProvider } from './PlayerProvider';
import { ScreenMemoryProvider } from './ScreenMemoryProvider';

export function RootLayout() {
  const { connected } = useGamepadBridge();
  return (
    <PlayerProvider>
      <ScreenMemoryProvider>
        <main className="app">
          <Outlet />
        </main>
        <TopHud controllerConnected={connected} />
      </ScreenMemoryProvider>
    </PlayerProvider>
  );
}
