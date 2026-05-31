import { useCallback } from 'react';

import { getStockChange } from '../../../lib/admin-api-client';
import type { StockDiffRecord } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

export function useStockChangeDetail(syncKey: string | null) {
  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) => {
      if (!syncKey) {
        return Promise.resolve(null);
      }

      return withAuth((idToken) => getStockChange(idToken, syncKey));
    },
    [syncKey],
  );

  return useAsyncData<StockDiffRecord | null>(loader, [syncKey]);
}
