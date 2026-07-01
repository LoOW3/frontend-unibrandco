import { env } from '../config/env';
import { es } from '../i18n/es';
import {
  AdminApiError,
  type AdminDashboardResponse,
  type ApiErrorResponse,
  type ManualSyncManifest,
  type ManualSyncResponse,
  type ManualSyncRunsResponse,
  type ManualSyncTriggerResponse,
  type PaginatedPatagoniaPedidosResponse,
  type PaginatedStockChangesResponse,
  type PatagoniaPedidoRecordResponse,
  type StockDiffRecord,
  type StockFileDownloadResponse,
  type StockFilesResponse,
} from '../types/admin-api';

export interface ListStockChangesParams {
  limit?: number;
  cursor?: string | null;
}

export interface ListPatagoniaPedidosParams {
  limit?: number;
  cursor?: string | null;
}

/**
 * Builds the stock change detail path preserving slash segments in syncKey.
 */
export function buildStockChangePath(syncKey: string): string {
  const segments = syncKey.split('/').map(encodeURIComponent).join('/');
  return `/admin/stock-changes/${segments}`;
}

async function adminFetch<T>(
  path: string,
  idToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.adminApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `${es.dashboard.requestFailed} (${response.status})`;

    try {
      const error = (await response.json()) as ApiErrorResponse;
      message = error.message ?? message;
    } catch {
      // Response body is not JSON.
    }

    throw new AdminApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function getAdminDashboard(idToken: string): Promise<AdminDashboardResponse> {
  return adminFetch<AdminDashboardResponse>('/dashboard/admin', idToken);
}

export async function listStockChanges(
  idToken: string,
  params?: ListStockChangesParams,
): Promise<PaginatedStockChangesResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const query = searchParams.toString();
  const path = query ? `/admin/stock-changes?${query}` : '/admin/stock-changes';

  return adminFetch<PaginatedStockChangesResponse>(path, idToken);
}

export async function getStockChange(
  idToken: string,
  syncKey: string,
): Promise<StockDiffRecord> {
  return adminFetch<StockDiffRecord>(buildStockChangePath(syncKey), idToken);
}

export async function listStockFiles(
  idToken: string,
  date: string,
): Promise<StockFilesResponse> {
  const searchParams = new URLSearchParams({ date });
  return adminFetch<StockFilesResponse>(`/admin/stock-files?${searchParams.toString()}`, idToken);
}

export async function triggerManualSync(idToken: string): Promise<ManualSyncResponse> {
  return adminFetch<ManualSyncResponse>('/stock/sync', idToken, { method: 'POST' });
}

export async function getStockFileDownloadUrl(
  idToken: string,
  syncKey: string,
): Promise<StockFileDownloadResponse> {
  const searchParams = new URLSearchParams({ syncKey });
  return adminFetch<StockFileDownloadResponse>(
    `/admin/stock-files/download?${searchParams.toString()}`,
    idToken,
  );
}

export async function downloadStockFile(idToken: string, syncKey: string): Promise<void> {
  const { downloadUrl } = await getStockFileDownloadUrl(idToken, syncKey);
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
}

export async function listPatagoniaPedidos(
  idToken: string,
  params?: ListPatagoniaPedidosParams,
): Promise<PaginatedPatagoniaPedidosResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const query = searchParams.toString();
  const path = query ? `/admin/patagonia-pedidos?${query}` : '/admin/patagonia-pedidos';

  return adminFetch<PaginatedPatagoniaPedidosResponse>(path, idToken);
}

export async function getPatagoniaPedido(
  idToken: string,
  codigo: string,
): Promise<PatagoniaPedidoRecordResponse> {
  const encoded = encodeURIComponent(codigo);
  return adminFetch<PatagoniaPedidoRecordResponse>(`/admin/patagonia-pedidos/${encoded}`, idToken);
}

/** Builds the manual-sync run detail path preserving slash segments in runId. */
export function buildManualSyncRunPath(runId: string): string {
  const segments = runId.split('/').map(encodeURIComponent).join('/');
  return `/admin/manual-sync/runs/${segments}`;
}

export async function triggerManualSyncRun(
  idToken: string,
  dryRun = false,
): Promise<ManualSyncTriggerResponse> {
  return adminFetch<ManualSyncTriggerResponse>('/admin/manual-sync/trigger', idToken, {
    method: 'POST',
    body: JSON.stringify({ dryRun }),
  });
}

export async function listManualSyncRuns(
  idToken: string,
  date: string,
): Promise<ManualSyncRunsResponse> {
  const searchParams = new URLSearchParams({ date });
  return adminFetch<ManualSyncRunsResponse>(
    `/admin/manual-sync/runs?${searchParams.toString()}`,
    idToken,
  );
}

export async function getManualSyncRun(
  idToken: string,
  runId: string,
): Promise<ManualSyncManifest> {
  return adminFetch<ManualSyncManifest>(buildManualSyncRunPath(runId), idToken);
}

export async function abortManualSyncRun(idToken: string, runId: string): Promise<void> {
  await adminFetch<{ runId: string; aborting: boolean }>('/admin/manual-sync/abort', idToken, {
    method: 'POST',
    body: JSON.stringify({ runId }),
  });
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}
