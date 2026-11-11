import { useEffect } from 'react';

export const SITE_NAME = 'Daniel Dampson';

/** Sets document.title while the calling screen is mounted. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
