import { useCallback } from 'react';

import { getPatagoniaPedido } from '../../../lib/admin-api-client';
import type { PatagoniaPedidoRecord } from '../../../types/admin-api';
import { useAsyncData } from './use-authenticated-fetch';

export function usePatagoniaPedidoDetail(codigo: string | null) {
  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) => {
      if (!codigo) {
        return Promise.resolve(null);
      }

      return withAuth((idToken) => getPatagoniaPedido(idToken, codigo));
    },
    [codigo],
  );

  return useAsyncData<PatagoniaPedidoRecord | null>(loader, [codigo]);
}
