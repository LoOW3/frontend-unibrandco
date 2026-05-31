export interface TiendanubePatchedItem {
  sku: string;
  newStock: number;
  previousStock?: number;
}

export interface TiendanubeSyncSummary {
  patchedAt: string;
  patchedCount: number;
  matchedCount: number;
  skippedDeleted: number;
  skippedNoSku: number;
}

export interface TiendanubeSyncResult extends TiendanubeSyncSummary {
  patchedItems: TiendanubePatchedItem[];
}

export interface AdminDashboardResponse {
  lastTiendanubeSync: {
    syncKey: string;
    syncedAt: string;
    patchedAt: string;
    patchedCount: number;
    patchedItems: TiendanubePatchedItem[];
  } | null;
}

export interface StockChangeSummary {
  pk: string;
  syncedAt: string;
  currentSyncKey: string;
  previousSyncKey: string;
  changedCount: number;
  createdAt: string;
  tiendanubeSync?: TiendanubeSyncSummary;
}

export interface PaginatedStockChangesResponse {
  items: StockChangeSummary[];
  nextCursor: string | null;
}

export interface StockFileEntry {
  s3Key: string;
  syncedAt: string;
  sizeBytes: number;
}

export interface StockFilesResponse {
  date: string;
  files: StockFileEntry[];
}

export interface StockFileDownloadResponse {
  syncKey: string;
  downloadUrl: string;
  expiresAt: string;
  contentType: string;
}

export interface StockChangeItem {
  CodigoArticulo: string;
  UnidadesDisponibles: number;
  UnidadesReservadas: number;
  UnidadesBloqueadas: number;
  UnidadesADespachar: number;
  UnidadesEnRecepcion: number;
  UnidadesTransitoInterno: number;
  UnidadesVencidas: number;
  UnidadesPedidas: number;
  previousUnidadesDisponibles?: number;
  new?: true;
  deleted?: true;
}

export interface StockDiffRecord {
  pk: string;
  recordType: 'STOCK_DIFF';
  syncedAt: string;
  currentSyncKey: string;
  previousSyncKey: string;
  changedItems: StockChangeItem[];
  changedCount: number;
  createdAt: string;
  tiendanubeSync?: TiendanubeSyncResult;
}

export interface ManualSyncResponse {
  s3Key: string;
  itemCount: number;
  syncedAt: string;
}

export interface ApiErrorResponse {
  message?: string;
}

export class AdminApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}
