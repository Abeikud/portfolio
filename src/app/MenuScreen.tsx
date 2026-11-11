import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MainMenu } from '../features/menu/MainMenu';
import { SITE_NAME, useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMenuSelection } from './menuSelectionContext';

/** The "/" route: the main menu, remembering where the user was. */
export function MenuScreen() {
  const navigate = useNavigate();
  const { selectedId, setSelectedId, returnPending, clearReturn } = useMenuSelection();

  useDocumentTitle(`${SITE_NAME} | Portfolio`);

  // MainMenu has focused the restored item by now (child effects run first).
  useEffect(() => {
    if (returnPending) clearReturn();
  }, [returnPending, clearReturn]);

  return (
    <MainMenu
      initialSelectedId={selectedId}
      onSelectionChange={(section) => setSelectedId(section.id)}
      onActivate={(section) =>
        navigate(section.route, { state: { from: '/' }, viewTransition: true })
      }
      autoFocusSelected={returnPending}
    />
  );
}
