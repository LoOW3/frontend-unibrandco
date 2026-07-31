import { useCallback, useState } from 'react';

import { listGoldFletes } from '../../../lib/admin-api-client';
import type { PaginatedGoldFletesResponse } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

const DEFAULT_LIMIT = 25;

export function useGoldFletes(limit: number = DEFAULT_LIMIT) {
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [requestedCursor, setRequestedCursor] = useState<string | undefined>(undefined);

  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) => listGoldFletes(idToken, { limit, cursor: requestedCursor })),
    [limit, requestedCursor],
  );

  const { data, error, isLoading, reload } = useAsyncData<PaginatedGoldFletesResponse>(loader, [
    requestedCursor,
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

  return {
    data,
    error,
    isLoading,
    goNext,
    goPrevious,
    hasNext: Boolean(data?.nextCursor),
    hasPrevious: cursorStack.length > 0,
    reload,
  };
}
