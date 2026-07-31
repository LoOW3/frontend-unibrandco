import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import { useStockChangeDetail } from '../hooks/use-stock-change-detail';
import { ActorBadge } from './actor-badge';

interface StockChangeDetailDialogProps {
  syncKey: string | null;
  open: boolean;
  onClose: () => void;
}

function DetailMetric({
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
      <p className={breakWords ? 'break-all text-sm' : 'text-sm'}>{value}</p>
    </div>
  );
}

function getItemFlag(item: { new?: boolean; deleted?: boolean }): string {
  if (item.new) return es.detailDialog.flagNew;
  if (item.deleted) return es.detailDialog.flagDeleted;
  return es.detailDialog.flagChanged;
}

export function StockChangeDetailDialog({ syncKey, open, onClose }: StockChangeDetailDialogProps) {
  const isMobile = useIsMobile();
  const { data, error, isLoading } = useStockChangeDetail(open ? syncKey : null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent fullScreen={isMobile} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{es.detailDialog.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        {data ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-3">
                <DetailMetric label={es.detailDialog.currentSyncKey} value={data.currentSyncKey} breakWords />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <DetailMetric label={es.detailDialog.previousSyncKey} value={data.previousSyncKey} breakWords />
              </div>
              <DetailMetric label={es.detailDialog.syncedAt} value={formatDateTime(data.syncedAt)} />
              <DetailMetric label={es.detailDialog.changedCount} tooltip={es.tooltips.changedCount} value={data.changedCount} />
              <DetailMetric label={es.detailDialog.createdAt} value={formatDateTime(data.createdAt)} />
              <div>
                <span className="text-xs text-muted-foreground">{es.manualSync.triggeredBy}</span>
                <div className="mt-1">
                  <ActorBadge email={data.triggeredBy ?? null} />
                </div>
              </div>
            </div>

            {data.tiendanubeSync ? (
              <>
                <Separator />
                <p className="text-sm font-semibold">
                  <TiendanubeBrandText text={es.detailDialog.tiendanubeSync} />
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <DetailMetric label={es.detailDialog.patchedAt} tooltip={es.tooltips.patchedAt} value={formatDateTime(data.tiendanubeSync.patchedAt)} />
                  <DetailMetric label={es.detailDialog.patched} tooltip={es.tooltips.patched} value={data.tiendanubeSync.patchedCount} />
                  <DetailMetric label={es.detailDialog.matched} tooltip={es.tooltips.matched} value={data.tiendanubeSync.matchedCount} />
                  <DetailMetric label={es.detailDialog.skippedDeleted} tooltip={es.tooltips.skippedDeleted} value={data.tiendanubeSync.skippedDeleted} />
                  <DetailMetric label={es.detailDialog.skippedNoSku} tooltip={es.tooltips.skippedNoSku} value={data.tiendanubeSync.skippedNoSku} />
                </div>
              </>
            ) : null}

            <Separator />
            <LabelWithTooltip
              label={es.detailDialog.changedItems}
              tooltip={es.tooltips.changedItems}
              className="border-none text-sm font-semibold text-foreground"
            />
            <div className="max-h-72 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>{es.detailDialog.article}</TableHead>
                    <TableHead className="text-right">{es.detailDialog.available}</TableHead>
                    <TableHead className="text-right">{es.detailDialog.previous}</TableHead>
                    <TableHead>{es.detailDialog.flags}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.changedItems.map((item) => (
                    <TableRow key={item.CodigoArticulo}>
                      <TableCell className="font-mono text-xs">{item.CodigoArticulo}</TableCell>
                      <TableCell className="text-right">{item.UnidadesDisponibles}</TableCell>
                      <TableCell className="text-right">{item.previousUnidadesDisponibles ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{getItemFlag(item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {data.tiendanubeSync?.patchedItems.length ? (
              <>
                <Separator />
                <LabelWithTooltip
                  label={es.detailDialog.patchedItems}
                  tooltip={es.tooltips.patchedItems}
                  className="border-none text-sm font-semibold text-foreground"
                />
                <div className="max-h-60 overflow-auto rounded-md border border-border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
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
                      {data.tiendanubeSync.patchedItems.map((item) => (
                        <TableRow key={item.sku}>
                          <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                          <TableCell className="text-right">{item.previousStock ?? '—'}</TableCell>
                          <TableCell className="text-right">{item.newStock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
