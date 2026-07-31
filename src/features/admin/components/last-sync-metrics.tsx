import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { AdminDashboardResponse } from '../../../types/admin-api';
import { ActorBadge } from './actor-badge';

interface LastSyncMetricsProps {
  data: AdminDashboardResponse | null;
  error: string | null;
  isLoading: boolean;
}

function MetricItem({
  label,
  value,
  tooltip,
  breakWords = false,
}: {
  label: string;
  value: string | number;
  tooltip?: string;
  breakWords?: boolean;
}) {
  return (
    <div>
      {tooltip ? (
        <LabelWithTooltip label={label} tooltip={tooltip} />
      ) : (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
      <p className={breakWords ? 'break-all text-sm font-semibold' : 'font-semibold'}>{value}</p>
    </div>
  );
}

export function LastSyncMetrics({ data, error, isLoading }: LastSyncMetricsProps) {
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

  const lastSync = data?.lastTiendanubeSync;

  if (!lastSync) {
    return (
      <Alert variant="info">
        <TiendanubeBrandText text={es.metrics.noSyncYet} />
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 text-base font-semibold">
          <LabelWithTooltip
            label={es.metrics.lastTiendanubeSync}
            tooltip={es.tooltips.lastTiendanubeSync}
            className="border-none text-base text-foreground"
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricItem label={es.metrics.syncKey} tooltip={es.tooltips.syncKey} value={lastSync.syncKey} breakWords />
          <MetricItem label={es.metrics.syncedAtUtc} tooltip={es.tooltips.syncedAtUtc} value={formatDateTime(lastSync.syncedAt)} />
          <MetricItem label={es.metrics.patchedAtUtc} tooltip={es.tooltips.patchedAtUtc} value={formatDateTime(lastSync.patchedAt)} />
          <MetricItem label={es.metrics.patchedSkus} tooltip={es.tooltips.patchedSkus} value={lastSync.patchedCount} />
          <div>
            <span className="text-xs text-muted-foreground">{es.manualSync.triggeredBy}</span>
            <div className="mt-1">
              <ActorBadge email={lastSync.triggeredBy ?? null} />
            </div>
          </div>
        </div>

        {lastSync.patchedItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{es.metrics.sku}</TableHead>
                <TableHead className="text-right">
                  <LabelWithTooltip label={es.metrics.previousStock} tooltip={es.tooltips.previousStock} align="right" />
                </TableHead>
                <TableHead className="text-right">
                  <LabelWithTooltip label={es.metrics.newStock} tooltip={es.tooltips.newStock} align="right" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lastSync.patchedItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="text-right">{item.previousStock ?? '—'}</TableCell>
                  <TableCell className="text-right">{item.newStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">{es.metrics.noPatchedItems}</p>
        )}
      </CardContent>
    </Card>
  );
}
</content>
