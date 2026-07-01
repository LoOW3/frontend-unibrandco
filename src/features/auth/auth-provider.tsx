import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  confirmSignIn as amplifyConfirmSignIn,
  fetchAuthSession,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';

import { AuthContext, type AuthContextValue } from './auth-context';

interface TokenClaims {
  email: string | null;
  name: string | null;
  groups: string[];
}

function parseClaims(idToken: string): TokenClaims {
  try {
    const payload = idToken.split('.')[1];
    if (!payload) {
      return { email: null, name: null, groups: [] };
    }

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      email?: string;
      name?: string;
      'cognito:groups'?: string[];
    };

    return {
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      groups: decoded['cognito:groups'] ?? [],
    };
  } catch {
    return { email: null, name: null, groups: [] };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString() ?? null;

    setIsAuthenticated(Boolean(idToken));

    if (idToken) {
      const claims = parseClaims(idToken);
      setEmail(claims.email);
      setName(claims.name);
      setIsAdmin(claims.groups.includes('ADMIN') || claims.groups.includes('SUPER_ADMIN'));
      setIsSuperAdmin(claims.groups.includes('SUPER_ADMIN'));
    } else {
      setEmail(null);
      setName(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }

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
    async (emailInput: string, password: string): Promise<{ requiresNewPassword: boolean }> => {
      const { nextStep } = await amplifySignIn({ username: emailInput, password });
      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        return { requiresNewPassword: true };
      }
      await refreshSession();
      return { requiresNewPassword: false };
    },
    [refreshSession],
  );

  const completeNewPassword = useCallback(
    async (newPassword: string): Promise<void> => {
      const { isSignedIn } = await amplifyConfirmSignIn({ challengeResponse: newPassword });
      if (isSignedIn) {
        await refreshSession();
      }
    },
    [refreshSession],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await amplifySignOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setEmail(null);
    setName(null);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    return refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isAdmin,
      isSuperAdmin,
      email,
      name,
      signIn,
      completeNewPassword,
      signOut,
      getIdToken,
    }),
    [
      completeNewPassword,
      email,
      getIdToken,
      isAdmin,
      isAuthenticated,
      isLoading,
      isSuperAdmin,
      name,
      signIn,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
