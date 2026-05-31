import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchAuthSession,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';

import { AuthContext, type AuthContextValue } from './auth-context';

function parseGroupsFromToken(idToken: string): string[] {
  try {
    const payload = idToken.split('.')[1];
    if (!payload) {
      return [];
    }

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      'cognito:groups'?: string[];
    };

    return decoded['cognito:groups'] ?? [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString() ?? null;

    setIsAuthenticated(Boolean(idToken));
    setIsAdmin(idToken ? parseGroupsFromToken(idToken).includes('ADMIN') : false);

    return idToken;
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refreshSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      await amplifySignIn({ username: email, password });
      await refreshSession();
    },
    [refreshSession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await amplifySignOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    return refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isAdmin,
      signIn,
      signOut,
      getIdToken,
    }),
    [getIdToken, isAdmin, isAuthenticated, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
