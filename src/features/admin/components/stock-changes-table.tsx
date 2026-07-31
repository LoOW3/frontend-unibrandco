import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { StockChangeSummary } from '../../../types/admin-api';
import { ActorBadge } from './actor-badge';
import { StockChangesMobileList } from './stock-changes-mobile-list';
import { StockFileDownloadButton } from './stock-file-download-button';

interface StockChangesTableProps {
  items: StockChangeSummary[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (syncKey: string) => void;
}

export function StockChangesTable({
  items,
  error,
  isLoading,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: StockChangesTableProps) {
  const isMobile = useIsMobile();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">{es.stockChanges.title}</h2>

        {error ? <Alert variant="destructive" className="mb-4">{error}</Alert> : null}
        {downloadError ? <Alert variant="destructive" className="mb-4">{downloadError}</Alert> : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : isMobile ? (
          <StockChangesMobileList
            items={items}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={onNext}
            onPrevious={onPrevious}
            onRowClick={onRowClick}
            onDownloadError={setDownloadError}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{es.stockChanges.syncedAt}</TableHead>
                  <TableHead className="text-right">
                    <LabelWithTooltip label={es.stockChanges.changed} tooltip={es.tooltips.changed} align="right" />
                  </TableHead>
                  <TableHead className="text-right">
                    <LabelWithTooltip label={es.stockChanges.patched} tooltip={es.tooltips.patched} align="right" />
                  </TableHead>
                  <TableHead>{es.stockChanges.createdAt}</TableHead>
                  <TableHead>{es.manualSync.triggeredBy}</TableHead>
                  <TableHead className="text-center">{es.stockChanges.download}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-muted-foreground">
                      {es.stockChanges.noChanges}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.pk} className="cursor-pointer" onClick={() => onRowClick(item.currentSyncKey)}>
                      <TableCell>{formatDateTime(item.syncedAt)}</TableCell>
                      <TableCell className="text-right">{item.changedCount}</TableCell>
                      <TableCell className="text-right">{item.tiendanubeSync?.patchedCount ?? '—'}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell>
                        <ActorBadge email={item.triggeredBy ?? null} />
                      </TableCell>
                      <TableCell className="text-center" onClick={(event) => event.stopPropagation()}>
                        <StockFileDownloadButton syncKey={item.currentSyncKey} onError={setDownloadError} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" disabled={!hasPrevious} onClick={onPrevious}>
                {es.stockChanges.previousPage}
              </Button>
              <Button variant="outline" disabled={!hasNext} onClick={onNext}>
                {es.stockChanges.nextPage}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
</content>
