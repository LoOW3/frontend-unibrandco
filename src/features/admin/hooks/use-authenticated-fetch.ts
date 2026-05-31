import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../auth/use-auth';
import { es } from '../../../i18n/es';
import { isAdminApiError } from '../../../lib/admin-api-client';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useAuthenticatedFetch() {
  const { getIdToken, signOut } = useAuth();
  const navigate = useNavigate();

  const withAuth = useCallback(
    async <T,>(fetcher: (idToken: string) => Promise<T>): Promise<T> => {
      const idToken = await getIdToken();

      if (!idToken) {
        await signOut();
        navigate('/login', { replace: true });
        throw new Error(es.auth.sessionExpired);
      }

      try {
        return await fetcher(idToken);
      } catch (error: unknown) {
        if (isAdminApiError(error) && error.status === 401) {
          await signOut();
          navigate('/login', { replace: true });
        }

        throw error;
      }
    },
    [getIdToken, navigate, signOut],
  );

  return { withAuth };
}

export function useAsyncData<T>(
  loader: (withAuth: <R>(fetcher: (idToken: string) => Promise<R>) => Promise<R>) => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> & { reload: () => void } {
  const { withAuth } = useAuthenticatedFetch();
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const data = await loader(withAuth);

        if (!cancelled) {
          setState({ data, error: null, isLoading: false });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : es.dashboard.requestFailed;
          setState({ data: null, error: message, isLoading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, withAuth, reloadToken, ...deps]);

  return { ...state, reload };
}
