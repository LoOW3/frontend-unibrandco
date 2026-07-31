import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { es } from '../../../i18n/es';
import { formatCurrency, formatNumber } from '../../../lib/format';
import type { GoldNamedTotal, GoldSummary } from '../../../types/admin-api';

interface GoldSummaryViewProps {
  data: GoldSummary | null;
  error: string | null;
  isLoading: boolean;
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function TotalsList({ title, items, money }: { title: string; items: GoldNamedTotal[]; money?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-medium">{title}</p>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es.gold.noData}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-muted-foreground">{item.label}</span>
                <span className="shrink-0 font-medium tabular-nums">
                  {money ? formatCurrency(item.total) : formatNumber(item.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function GoldSummaryView({ data, error, isLoading }: GoldSummaryViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-7" />
      </div>
    );
  }
  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }
  if (!data) {
    return <p className="text-sm text-muted-foreground">{es.gold.noData}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label={es.gold.ventasTotales} value={formatCurrency(data.ventasTotales)} />
        <Kpi label={es.gold.margenTotal} value={formatCurrency(data.margenTotal)} />
        <Kpi label={es.gold.unidadesTotales} value={formatNumber(data.unidadesTotales)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TotalsList title={es.gold.ventasPorCanal} items={data.ventasPorCanal} money />
        <TotalsList title={es.gold.ventasPorMes} items={data.ventasPorMes} money />
        <TotalsList title={es.gold.topMarcas} items={data.topMarcas} money />
        <TotalsList title={es.gold.topClientes} items={data.topClientes} money />
      </div>
    </div>
  );
}
