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

export type ManualSyncStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ManualSyncCounts {
  patagoniaItems?: number;
  tnProducts?: number;
  matched?: number;
  skipped?: number;
  patched?: number;
  sendChunksTotal?: number;
  sendChunksSent?: number;
}

export interface ManualSyncStep {
  key: string;
  label: string;
  status: ManualSyncStatus;
  startedAt?: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ManualSyncArtifact {
  label: string;
  s3Key: string;
  sizeBytes: number;
}

export interface ManualSyncManifest {
  runId: string;
  runPrefix: string;
  startedAt: string;
  completedAt: string | null;
  status: ManualSyncStatus;
  triggeredBy: string | null;
  executionArn: string | null;
  dryRun: boolean;
  currentStep: string | null;
  progress: number;
  steps: ManualSyncStep[];
  artifacts: ManualSyncArtifact[];
  counts: ManualSyncCounts;
  error: string | null;
}

export interface ManualSyncRunSummary {
  runId: string;
  status: ManualSyncStatus;
  startedAt: string;
  completedAt: string | null;
  progress: number;
  currentStep: string | null;
  triggeredBy: string | null;
  dryRun: boolean;
  counts: ManualSyncCounts;
  error: string | null;
}

export interface ManualSyncRunsResponse {
  date: string;
  runs: ManualSyncRunSummary[];
}

export interface ManualSyncTriggerResponse {
  runId: string;
  executionArn: string;
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

export interface OrderUserData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderProductSummary {
  id: number;
  variant_id: string | number;
  quantity: string | number;
  sku: string | null;
}

export interface OrderProductsSummary {
  id: number;
  products: OrderProductSummary[];
  userData: OrderUserData;
}

export interface PatagoniaCreatePedidoItem {
  linea: string;
  articuloCodigo: string;
  unidades: number;
}

export interface PatagoniaCreatePedido {
  codigo: string;
  clienteUbicacionCodigo: string;
  fecha: string;
  estado: 'Pendiente' | 'PendienteGestion';
  observacion?: string | null;
  items: PatagoniaCreatePedidoItem[];
}

export type PatagoniaPedidoStatus = 'pending' | 'shipped';

export type PatagoniaPedidoFulfillmentStatus = 'PACKED' | 'DISPATCHED';

export interface PatagoniaPedidoListItem {
  codigo: string;
  tiendanubeOrderId: number;
  createdAt: string;
  itemCount: number;
  status: PatagoniaPedidoStatus;
  fulfillmentStatus?: PatagoniaPedidoFulfillmentStatus;
  shippedAt?: string;
}

export interface PaginatedPatagoniaPedidosResponse {
  items: PatagoniaPedidoListItem[];
  nextCursor: string | null;
}

export interface PatagoniaPedidoRecord {
  pk: string;
  recordType: 'patagonia-pedido';
  createdAt: string;
  codigo: string;
  tiendanubeOrderId: number;
  itemCount: number;
  summary: OrderProductsSummary;
  createPedido: PatagoniaCreatePedido;
  fulfillmentStatus?: PatagoniaPedidoFulfillmentStatus;
  shippedAt?: string;
  tiendanubeFulfillmentIds?: string[];
  digipCompletoAt?: string;
}

export type PatagoniaPedidoRecordResponse = PatagoniaPedidoRecord & {
  status: PatagoniaPedidoStatus;
};
