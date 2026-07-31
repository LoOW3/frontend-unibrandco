import { useCallback } from 'react';

import { getGoldSummary } from '../../../lib/admin-api-client';
import type { GetGoldSummaryParams, GoldSummary } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

export function useGoldSummary(params?: GetGoldSummaryParams) {
  const mes = params?.mes;
  const canal = params?.canal;

  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) => getGoldSummary(idToken, { mes, canal })),
    [mes, canal],
  );

  return useAsyncData<GoldSummary>(loader, [mes, canal]);
}
