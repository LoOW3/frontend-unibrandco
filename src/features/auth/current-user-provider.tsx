import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { es } from '../../i18n/es';
import { getMe } from '../../lib/admin-api-client';
import type { AdminUser } from '../../types/admin-api';
import { useAuthenticatedFetch } from '../admin/hooks/use-authenticated-fetch';
import { CurrentUserContext, type CurrentUserContextValue } from './current-user-context';

/**
 * Loads the authenticated user's /me once and shares it across the admin app,
 * so the topbar and profile page stay in sync without refetching per page.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { withAuth } = useAuthenticatedFetch();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const me = await withAuth((idToken) => getMe(idToken));
      setUser(me);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : es.dashboard.requestFailed);
    } finally {
      setIsLoading(false);
    }
  }, [withAuth]);

  useEffect(() => {
    // Guard against StrictMode's double mount firing two fetches.
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ user, isLoading, error, refresh, setUser }),
    [user, isLoading, error, refresh],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}
