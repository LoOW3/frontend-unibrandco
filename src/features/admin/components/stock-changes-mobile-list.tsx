import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { formatDateTime } from '../../../lib/format';
import { es } from '../../../i18n/es';
import type { StockChangeSummary } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

interface StockChangesMobileListProps {
  items: StockChangeSummary[];
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (syncKey: string) => void;
  onDownloadError: (message: string) => void;
}

export function StockChangesMobileList({
  items,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
  onDownloadError,
}: StockChangesMobileListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{es.stockChanges.noChanges}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Card key={item.pk}>
          <CardContent className="flex items-start justify-between gap-2 py-3">
            <button
              type="button"
              onClick={() => onRowClick(item.currentSyncKey)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-sm font-medium">{formatDateTime(item.syncedAt)}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <LabelWithTooltip label={`${es.stockChanges.changed}:`} tooltip={es.tooltips.changed} />{' '}
                {item.changedCount} ·{' '}
                <LabelWithTooltip label={`${es.stockChanges.patched}:`} tooltip={es.tooltips.patched} />{' '}
                {item.tiendanubeSync?.patchedCount ?? '—'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {es.stockChanges.created(formatDateTime(item.createdAt))}
              </p>
            </button>
            <div onClick={(event) => event.stopPropagation()}>
              <StockFileDownloadButton syncKey={item.currentSyncKey} onError={onDownloadError} />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" disabled={!hasPrevious} onClick={onPrevious}>
          {es.stockChanges.previousPage}
        </Button>
        <Button variant="outline" className="flex-1" disabled={!hasNext} onClick={onNext}>
          {es.stockChanges.nextPage}
        </Button>
      </div>
    </div>
  );
}
</content>
