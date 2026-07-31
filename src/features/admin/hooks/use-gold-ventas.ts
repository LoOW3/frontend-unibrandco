import { useCallback, useMemo, useState } from 'react';

import { listGoldVentas } from '../../../lib/admin-api-client';
import type { PaginatedGoldVentasResponse } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

const DEFAULT_LIMIT = 25;

export interface GoldVentasFilters {
  canal?: string;
  mes?: string;
  marca?: string;
}

export function useGoldVentas(filters: GoldVentasFilters = {}, limit: number = DEFAULT_LIMIT) {
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [requestedCursor, setRequestedCursor] = useState<string | undefined>(undefined);

  // Serialize filters so effect deps stay primitive; reset pagination on change.
  const filterKey = useMemo(
    () => JSON.stringify({ canal: filters.canal, mes: filters.mes, marca: filters.marca }),
    [filters.canal, filters.mes, filters.marca],
  );

  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) =>
        listGoldVentas(idToken, {
          limit,
          cursor: requestedCursor,
          canal: filters.canal,
          mes: filters.mes,
          marca: filters.marca,
        }),
      ),
    [limit, requestedCursor, filters.canal, filters.mes, filters.marca],
  );

  const { data, error, isLoading, reload } = useAsyncData<PaginatedGoldVentasResponse>(loader, [
    requestedCursor,
    filterKey,
  ]);

  const goNext = (): void => {
    if (!data?.nextCursor) {
      return;
    }
    setCursorStack((stack) => [...stack, requestedCursor ?? '']);
    setRequestedCursor(data.nextCursor);
  };

  const goPrevious = (): void => {
    if (cursorStack.length === 0) {
      return;
    }
    const previousStack = [...cursorStack];
    const previousCursor = previousStack.pop();
    setCursorStack(previousStack);
    setRequestedCursor(previousCursor || undefined);
  };

  const resetToFirstPage = (): void => {
    setCursorStack([]);
    setRequestedCursor(undefined);
  };

  return {
    data,
    error,
    isLoading,
    goNext,
    goPrevious,
    resetToFirstPage,
    hasNext: Boolean(data?.nextCursor),
    hasPrevious: cursorStack.length > 0,
    reload,
  };
}
