import { useCallback } from 'react';

import { getAdminDashboard } from '../../../lib/admin-api-client';
import type { AdminDashboardResponse } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

export function useAdminDashboard() {
  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) => getAdminDashboard(idToken)),
    [],
  );

  return useAsyncData<AdminDashboardResponse>(loader);
}
