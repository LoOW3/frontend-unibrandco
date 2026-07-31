import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/cn';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { ManualSyncManifest, ManualSyncRunSummary, ManualSyncStatus } from '../../../types/admin-api';
import { ActorBadge } from './actor-badge';
import { manualSyncStatusChip } from './manual-sync-run-detail';

/** Returns the run-N label from a runId like manual-sync/2026/07/01/run-3. */
function runLabel(runId: string): string {
  return runId.split('/').pop() ?? runId;
}

interface ManualSyncRunsTableProps {
  runs: ManualSyncRunSummary[];
  date: string;
  selectedRunId: string | null;
  onSelect: (runId: string) => void;
  error: string | null;
  isLoading: boolean;
  /** Live manifest of the active run; overrides its row's status/progress. */
  liveManifest?: ManualSyncManifest | null;
}

export function ManualSyncRunsTable({
  runs,
  date,
  selectedRunId,
  onSelect,
  error,
  isLoading,
  liveManifest,
}: ManualSyncRunsTableProps) {
  const isMobile = useIsMobile();

  /** Live status/progress for a row when it matches the polled active run. */
  const liveFor = (run: ManualSyncRunSummary): { status: ManualSyncStatus; progress: number } =>
    liveManifest && liveManifest.runId === run.runId
      ? { status: liveManifest.status, progress: liveManifest.progress }
      : { status: run.status, progress: run.progress };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">{es.manualSync.runsFor(date)}</h2>

        {error ? (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es.manualSync.noRuns}</p>
        ) : isMobile ? (
          <div className="flex flex-col gap-2">
            {runs.map((run) => {
              const live = liveFor(run);
              const chip = manualSyncStatusChip(live.status);
              return (
                <Card
                  key={run.runId}
                  className={cn(run.runId === selectedRunId && 'border-primary')}
                >
                  <CardContent className="py-3">
                    <button type="button" onClick={() => onSelect(run.runId)} className="w-full text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{runLabel(run.runId)}</span>
                        <Badge variant={chip.variant}>
                          {chip.icon}
                          {chip.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(run.startedAt)} · {live.progress}%
                      </p>
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{es.manualSync.run}</TableHead>
                <TableHead>{es.manualSync.status}</TableHead>
                <TableHead>{es.manualSync.startedAt}</TableHead>
                <TableHead>{es.manualSync.triggeredBy}</TableHead>
                <TableHead className="text-right">{es.manualSync.progress}</TableHead>
                <TableHead className="text-right">{es.manualSync.countPatched}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const live = liveFor(run);
                const chip = manualSyncStatusChip(live.status);
                return (
                  <TableRow
                    key={run.runId}
                    onClick={() => onSelect(run.runId)}
                    className={cn('cursor-pointer', run.runId === selectedRunId && 'bg-accent')}
                  >
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        {runLabel(run.runId)}
                        {run.dryRun ? <Badge variant="outline">{es.manualSync.dryRunTag}</Badge> : null}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={chip.variant}>
                        {chip.icon}
                        {chip.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                    <TableCell>
                      <ActorBadge email={run.triggeredBy} />
                    </TableCell>
                    <TableCell className="text-right">{live.progress}%</TableCell>
                    <TableCell className="text-right">{run.counts.patched ?? '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
