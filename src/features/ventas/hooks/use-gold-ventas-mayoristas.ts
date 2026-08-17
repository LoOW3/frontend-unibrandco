import { useCallback } from 'react';

import { getGoldVentasMayoristas } from '../../../lib/admin-api-client';
import type { GetGoldVentasMayoristasParams, GoldVentasMayoristas } from '../../../types/admin-api';
import { useAsyncData } from '../../admin/hooks/use-authenticated-fetch';

export function useGoldVentasMayoristas(params?: GetGoldVentasMayoristasParams) {
  const vendedor = params?.vendedor;
  const empresa = params?.empresa;
  const mes = params?.mes;

  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) => getGoldVentasMayoristas(idToken, { vendedor, empresa, mes })),
    [vendedor, empresa, mes],
  );

  return useAsyncData<GoldVentasMayoristas>(loader, [vendedor, empresa, mes]);
}
