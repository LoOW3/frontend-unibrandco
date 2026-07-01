import { createContext } from 'react';

import type { AdminUser } from '../../types/admin-api';

export interface CurrentUserContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setUser: (user: AdminUser) => void;
}

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);
