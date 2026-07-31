import { RefreshCw } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { TiendanubeBrandText } from '../../components/tiendanube-brand';
import { es } from '../../i18n/es';
import {
  abortManualSyncRun,
  getManualSyncRun,
  isAdminApiError,
  listManualSyncRuns,
  triggerManualSyncRun,
} from '../../lib/admin-api-client';
import type { ManualSyncManifest, ManualSyncRunsResponse } from '../../types/admin-api';
import { ManualSyncRunDetail } from './components/manual-sync-run-detail';
import { ManualSyncRunDetailDialog } from './components/manual-sync-run-detail-dialog';
import { ManualSyncRunsTable } from './components/manual-sync-runs-table';
import { useAsyncData, useAuthenticatedFetch } from './hooks/use-authenticated-fetch';

dayjs.extend(utc);

const POLL_INTERVAL_MS = 4000;

function getUtcDateString(value: Dayjs): string {
  return value.utc().format('YYYY-MM-DD');
}

function isActiveStatus(status: string): boolean {
  return status === 'RUNNING' || status === 'PENDING';
}

export function ManualSyncPage() {
  const { withAuth } = useAuthenticatedFetch();

  const maxDate = dayjs.utc().startOf('day');
  const minDate = maxDate.subtract(30, 'day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs.utc().startOf('day'));

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeManifest, setActiveManifest] = useState<ManualSyncManifest | null>(null);
  const [activeError, setActiveError] = useState<string | null>(null);
  const finishedRunRef = useRef<string | null>(null);

  const [dialogRunId, setDialogRunId] = useState<string | null>(null);

  const [dryRun, setDryRun] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const [isAborting, setIsAborting] = useState(false);
  const [abortConfirmOpen, setAbortConfirmOpen] = useState(false);

  const runsLoader = useCallback(
    (auth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      auth((idToken) => listManualSyncRuns(idToken, getUtcDateString(selectedDate))),
    [selectedDate],
  );
  const runs = useAsyncData<ManualSyncRunsResponse>(runsLoader, [selectedDate]);

  const reloadRunsRef = useRef(runs.reload);
  reloadRunsRef.current = runs.reload;

  const dateLabel = useMemo(() => getUtcDateString(selectedDate), [selectedDate]);

  // Pick up an in-progress run from the list (e.g. after a page refresh mid-run).
  useEffect(() => {
    if (activeRunId) {
      return;
    }
    const running = runs.data?.runs.find((run) => isActiveStatus(run.status));
    if (running && running.runId !== finishedRunRef.current) {
      setActiveRunId(running.runId);
    }
  }, [runs.data, activeRunId]);

  // Poll the active run's manifest until it reaches a terminal state.
  useEffect(() => {
    if (!activeRunId) {
      setActiveManifest(null);
      setActiveError(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (): Promise<void> => {
      try {
        const result = await withAuth((idToken) => getManualSyncRun(idToken, activeRunId));
        if (cancelled) {
          return;
        }
        setActiveError(null);

        if (isActiveStatus(result.status)) {
          setActiveManifest(result);
          timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        } else {
          // Terminal: drop the inline card and refresh the list to show the final row.
          finishedRunRef.current = activeRunId;
          setActiveManifest(null);
          setActiveRunId(null);
          reloadRunsRef.current();
        }
      } catch (error) {
        if (!cancelled) {
          setActiveError(error instanceof Error ? error.message : es.dashboard.requestFailed);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [activeRunId, withAuth]);

  const handleTrigger = async (): Promise<void> => {
    setIsTriggering(true);
    setTriggerError(null);
    try {
      const result = await withAuth((idToken) => triggerManualSyncRun(idToken, dryRun));
      finishedRunRef.current = null;
      setActiveRunId(result.runId);
      reloadRunsRef.current();
    } catch (error) {
      if (isAdminApiError(error) && error.status === 409) {
        setTriggerError(es.manualSync.alreadyRunning);
        reloadRunsRef.current();
      } else {
        setTriggerError(error instanceof Error ? error.message : es.manualSync.triggerFailed);
      }
    } finally {
      setIsTriggering(false);
    }
  };

  const doAbort = async (): Promise<void> => {
    if (!activeRunId) {
      return;
    }
    setIsAborting(true);
    try {
      await withAuth((idToken) => abortManualSyncRun(idToken, activeRunId));
      setAbortConfirmOpen(false);
      // Status flips to ABORTED via polling; keep the button spinner until then.
    } catch (error) {
      setActiveError(error instanceof Error ? error.message : es.dashboard.requestFailed);
      setAbortConfirmOpen(false);
    } finally {
      setIsAborting(false);
    }
  };

  const handleAbortClick = (): void => {
    // Steps 1–5 mutate nothing → abort straight away. Step 6 (send-patch) is
    // already updating Tiendanube → confirm first.
    if (activeManifest?.currentStep === 'send-patch') {
      setAbortConfirmOpen(true);
    } else {
      void doAbort();
    }
  };

  const runActive = Boolean(activeRunId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{es.manualSync.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <TiendanubeBrandText text={es.manualSync.description} />
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <Button disabled={isTriggering || runActive} onClick={() => void handleTrigger()}>
              {isTriggering ? <Spinner className="text-current" /> : <RefreshCw />}
              {isTriggering ? es.manualSync.triggering : es.manualSync.trigger}
            </Button>
            <div className="flex items-center gap-2">
              <Switch id="dry-run" checked={dryRun} disabled={runActive} onCheckedChange={setDryRun} />
              <Label htmlFor="dry-run" className="cursor-pointer">
                {es.manualSync.dryRun}
              </Label>
            </div>
          </div>
          {runActive ? <Alert variant="info" className="mt-4">{es.manualSync.alreadyRunning}</Alert> : null}
          {triggerError ? <Alert variant="destructive" className="mt-4">{triggerError}</Alert> : null}
        </CardContent>
      </Card>

      {activeRunId ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">{es.manualSync.activeRunTitle}</h2>
            {activeError ? <Alert variant="destructive" className="mb-4">{activeError}</Alert> : null}
            {activeManifest ? (
              <ManualSyncRunDetail manifest={activeManifest} onAbort={handleAbortClick} aborting={isAborting} />
            ) : (
              <div className="flex justify-center py-8">
                <Spinner className="size-7" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <DatePicker
        value={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        onChange={(value) => setSelectedDate(value.utc().startOf('day'))}
      />

      <ManualSyncRunsTable
        runs={runs.data?.runs ?? []}
        date={dateLabel}
        selectedRunId={activeRunId}
        onSelect={setDialogRunId}
        error={runs.error}
        isLoading={runs.isLoading}
        liveManifest={activeManifest}
      />

      <ManualSyncRunDetailDialog
        runId={dialogRunId}
        open={Boolean(dialogRunId)}
        onClose={() => setDialogRunId(null)}
      />

      <Dialog open={abortConfirmOpen} onOpenChange={(next) => !next && setAbortConfirmOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{es.manualSync.abortConfirmTitle}</DialogTitle>
            <DialogDescription>
              <TiendanubeBrandText text={es.manualSync.abortConfirmBody} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbortConfirmOpen(false)} disabled={isAborting}>
              {es.manualSync.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void doAbort()}
              disabled={isAborting}
            >
              {isAborting ? <Spinner className="text-current" /> : null}
              {isAborting ? es.manualSync.aborting : es.manualSync.abortConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
