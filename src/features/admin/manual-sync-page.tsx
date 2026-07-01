import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { esES } from '@mui/x-date-pickers/locales';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import 'dayjs/locale/es';

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

function ManualSyncDateProvider({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}

function isActiveStatus(status: string): boolean {
  return status === 'RUNNING' || status === 'PENDING';
}

function ManualSyncPageContent() {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}
        >
          {es.manualSync.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <TiendanubeBrandText text={es.manualSync.description} />
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Button
              variant="contained"
              startIcon={isTriggering ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
              disabled={isTriggering || runActive}
              onClick={() => void handleTrigger()}
            >
              {isTriggering ? es.manualSync.triggering : es.manualSync.trigger}
            </Button>
            <FormControlLabel
              control={
                <Switch
                  checked={dryRun}
                  disabled={runActive}
                  onChange={(event) => setDryRun(event.target.checked)}
                />
              }
              label={es.manualSync.dryRun}
            />
          </Box>
          {runActive ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {es.manualSync.alreadyRunning}
            </Alert>
          ) : null}
          {triggerError ? (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setTriggerError(null)}>
              {triggerError}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {activeRunId ? (
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
            <Typography variant="h6" gutterBottom>
              {es.manualSync.activeRunTitle}
            </Typography>
            {activeError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {activeError}
              </Alert>
            ) : null}
            {activeManifest ? (
              <ManualSyncRunDetail
                manifest={activeManifest}
                onAbort={handleAbortClick}
                aborting={isAborting}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}
          </CardContent>
        </Card>
      ) : null}

      <DatePicker
        label={es.manualSync.dateLabel}
        value={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        timezone="UTC"
        onChange={(value) => {
          if (value) {
            setSelectedDate(value.utc().startOf('day'));
          }
        }}
        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { maxWidth: { sm: 280 } } } }}
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

      <Dialog open={abortConfirmOpen} onClose={() => setAbortConfirmOpen(false)}>
        <DialogTitle>{es.manualSync.abortConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <TiendanubeBrandText text={es.manualSync.abortConfirmBody} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbortConfirmOpen(false)} disabled={isAborting}>
            {es.manualSync.cancel}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void doAbort()}
            disabled={isAborting}
            startIcon={isAborting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isAborting ? es.manualSync.aborting : es.manualSync.abortConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function ManualSyncPage() {
  return (
    <ManualSyncDateProvider>
      <ManualSyncPageContent />
    </ManualSyncDateProvider>
  );
}
