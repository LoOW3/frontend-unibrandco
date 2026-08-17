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
    triggeredBy?: string | null;
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
  triggeredBy?: string | null;
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
  triggeredBy?: string | null;
  tiendanubeSync?: TiendanubeSyncResult;
}

export type UserRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  email: string;
  sub: string | null;
  name: string | null;
  jobRole: string | null;
  avatarKey: string | null;
  avatarUrl: string | null;
  role: UserRole;
  groups: string[];
  enabled: boolean;
  status: string;
  createdAt: string | null;
}

export interface UsersListResponse {
  users: AdminUser[];
}

export interface AvatarUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface ManualSyncResponse {
  s3Key: string;
  itemCount: number;
  syncedAt: string;
}

export type ManualSyncStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ABORTED';

export interface ManualSyncCounts {
  patagoniaItems?: number;
  tnProducts?: number;
  tnPagesFetched?: number;
  tnPagesTotal?: number;
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

// ---------------------------------------------------------------------------
// Gold schema (datos finales limpiados — TABLERO / pipeline bronze→gold).
// Served by the admin API under /admin/gold/* (backend to be implemented).
// ---------------------------------------------------------------------------

export type GoldCanal = 'Mayorista' | 'Mercado Libre' | 'Tienda Nube';

export type ClienteCategoria = 'A' | 'B1' | 'B2' | 'C';

/** One sales line from gold.fact_ventas. */
export interface GoldVenta {
  canal: GoldCanal | string;
  unidad: string | null;
  tipo: string | null;
  nroOrden: string;
  fecha: string;
  mesComercial: string;
  sku: string;
  producto: string | null;
  cantidad: number;
  precioUnitario: number;
  precioNeto: number;
  costoUnitario: number | null;
  comision: number;
  envio: number;
  margenTotal: number;
  marca: string | null;
  cliente: string | null;
}

export interface PaginatedGoldVentasResponse {
  items: GoldVenta[];
  nextCursor: string | null;
}

export interface ListGoldVentasParams {
  limit?: number;
  cursor?: string | null;
  canal?: string;
  mes?: string;
  marca?: string;
}

/** One row from gold.clientes_clasificados. */
export interface GoldClienteClasificado {
  clienteId: string;
  nombre: string | null;
  rubro: string | null;
  provincia: string | null;
  localidad: string | null;
  zona: string | null;
  email: string | null;
  ticketPromedio: number;
  cantidadTickets: number;
  montoTotal: number;
  compraFacturado: boolean;
  compraNoFacturado: boolean;
  categoria: ClienteCategoria | string;
}

export interface PaginatedGoldClientesResponse {
  items: GoldClienteClasificado[];
  nextCursor: string | null;
}

export interface ListGoldClientesParams {
  limit?: number;
  cursor?: string | null;
  categoria?: string;
}

/** One row from gold.fact_ventas_flete. */
export interface GoldFleteLinea {
  nroOrden: string;
  sku: string;
  claveFila: string;
  fleteProrrateado: number;
  tieneFleteReal: boolean;
  fechaCalculo: string;
}

export interface PaginatedGoldFletesResponse {
  items: GoldFleteLinea[];
  nextCursor: string | null;
}

export interface ListGoldFletesParams {
  limit?: number;
  cursor?: string | null;
}

export interface GoldNamedTotal {
  label: string;
  total: number;
}

/** Aggregated KPIs for the dashboard summary tab. */
export interface GoldSummary {
  ventasTotales: number;
  margenTotal: number;
  unidadesTotales: number;
  ventasPorCanal: GoldNamedTotal[];
  ventasPorMes: GoldNamedTotal[];
  topMarcas: GoldNamedTotal[];
  topClientes: GoldNamedTotal[];
}

export interface GetGoldSummaryParams {
  mes?: string;
  canal?: string;
}

// ---------------------------------------------------------------------------
// Ventas Mayoristas — /admin/gold/ventas-mayoristas
// Siempre filtrado del lado del backend a canal='Mayorista' y excluye el
// vendedor 'AGENCIA' (no es un vendedor de planta). Ver diccionario de
// métricas para el detalle de cada cálculo.
// ---------------------------------------------------------------------------

export interface GoldMargenProveedor {
  label: string;
  margenPct: number;
  unidades: number;
}

export interface GoldFacturacionDiaVendedor {
  fecha: string;
  vendedor: string;
  total: number;
}

export interface GoldVentasMayoristas {
  facturacionNeta: number;
  costoMercaderia: number;
  unidades: number;
  margenTotal: number;
  margenAjustado: number;
  clientesConCompra: number;
  ticketPromedio: number;
  pctRentabilidadAjustada: number;
  pctFacturacionTop10Clientes: number;
  fleteTotalReal: number;
  fleteEstimadoFiltrado: number;
  facturacionPorProveedor: GoldNamedTotal[];
  margenPctPorProveedor: GoldMargenProveedor[];
  facturacionPorDiaVendedor: GoldFacturacionDiaVendedor[];
}

export interface GetGoldVentasMayoristasParams {
  vendedor?: string;
  empresa?: string;
  mes?: string;
}
