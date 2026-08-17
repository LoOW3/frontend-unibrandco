import { RefreshCw } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { es } from '../../i18n/es';
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format';
import { KpiCard } from './components/kpi-card';
import { ProveedorMargenChart } from './components/proveedor-margen-chart';
import { VentasCanalChart } from './components/ventas-canal-chart';
import { VentasPorDiaVendedorChart } from './components/ventas-por-dia-vendedor-chart';
// Reutilizamos el hook de datos, no la pagina de prueba en si -- es logica
// de datos (misma API, mismo patron useAsyncData), no diseno ni layout.
import { useGoldVentasMayoristas } from './hooks/use-gold-ventas-mayoristas';

export function VentasPage() {
  const ventas = useGoldVentasMayoristas();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{es.ventasDashboard.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{es.ventasDashboard.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={es.ventasDashboard.reload}
          onClick={ventas.reload}
          disabled={ventas.isLoading}
        >
          {ventas.isLoading ? <Spinner /> : <RefreshCw />}
        </Button>
      </div>

      {ventas.isLoading && !ventas.data ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-7" />
        </div>
      ) : ventas.error ? (
        <Alert variant="destructive">{ventas.error}</Alert>
      ) : !ventas.data ? (
        <p className="text-sm text-muted-foreground">{es.ventasDashboard.noData}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label={es.ventasDashboard.facturacionNeta}
              value={formatCurrency(ventas.data.facturacionNeta)}
            />
            <KpiCard
              label={es.ventasDashboard.costoMercaderia}
              value={formatCurrency(ventas.data.costoMercaderia)}
            />
            <KpiCard label={es.ventasDashboard.unidades} value={formatNumber(ventas.data.unidades)} />
            <KpiCard
              label={es.ventasDashboard.clientesConCompra}
              value={formatNumber(ventas.data.clientesConCompra)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard
              label={es.ventasDashboard.margenAjustado}
              value={formatCurrency(ventas.data.margenAjustado)}
            />
            <KpiCard
              label={es.ventasDashboard.pctRentabilidadAjustada}
              value={formatPercent(ventas.data.pctRentabilidadAjustada)}
            />
            <KpiCard
              label={es.ventasDashboard.ticketPromedio}
              value={formatCurrency(ventas.data.ticketPromedio)}
            />
            <KpiCard
              label={es.ventasDashboard.pctFacturacionTop10Clientes}
              value={formatPercent(ventas.data.pctFacturacionTop10Clientes)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              label={es.ventasDashboard.fleteTotalReal}
              value={formatCurrency(ventas.data.fleteTotalReal)}
            />
            <KpiCard
              label={es.ventasDashboard.fleteEstimadoFiltrado}
              value={formatCurrency(ventas.data.fleteEstimadoFiltrado)}
            />
          </div>

          <VentasPorDiaVendedorChart
            title={es.ventasDashboard.facturacionPorDiaVendedor}
            items={ventas.data.facturacionPorDiaVendedor}
            noDataLabel={es.ventasDashboard.noData}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <VentasCanalChart
              title={es.ventasDashboard.facturacionPorProveedor}
              items={ventas.data.facturacionPorProveedor}
              noDataLabel={es.ventasDashboard.noData}
            />
            <ProveedorMargenChart
              title={es.ventasDashboard.margenPctPorProveedor}
              items={ventas.data.margenPctPorProveedor}
              noDataLabel={es.ventasDashboard.noData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
