import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
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

import { es } from '../../i18n/es';
import {
  getManualSyncRun,
  listManualSyncRuns,
  triggerManualSyncRun,
} from '../../lib/admin-api-client';
import type { ManualSyncManifest, ManualSyncRunsResponse } from '../../types/admin-api';
import { ManualSyncRunDetail } from './components/manual-sync-run-detail';
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

function ManualSyncPageContent() {
  const { withAuth } = useAuthenticatedFetch();

  const maxDate = dayjs.utc().startOf('day');
  const minDate = maxDate.subtract(30, 'day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs.utc().startOf('day'));

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ManualSyncManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);

  const [dryRun, setDryRun] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const runsLoader = useCallback(
    (auth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      auth((idToken) => listManualSyncRuns(idToken, getUtcDateString(selectedDate))),
    [selectedDate],
  );
  const runs = useAsyncData<ManualSyncRunsResponse>(runsLoader, [selectedDate]);

  // Keep a stable ref to reload so the polling effect need not depend on it.
  const reloadRunsRef = useRef(runs.reload);
  reloadRunsRef.current = runs.reload;

  const dateLabel = useMemo(() => getUtcDateString(selectedDate), [selectedDate]);

  // Poll the selected run's manifest while it is still running.
  useEffect(() => {
    if (!selectedRunId) {
      setManifest(null);
      setManifestError(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (): Promise<void> => {
      try {
        const result = await withAuth((idToken) => getManualSyncRun(idToken, selectedRunId));
        if (cancelled) {
          return;
        }
        setManifest(result);
        setManifestError(null);

        if (result.status === 'RUNNING' || result.status === 'PENDING') {
          timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        } else {
          reloadRunsRef.current();
        }
      } catch (error) {
        if (!cancelled) {
          setManifestError(error instanceof Error ? error.message : es.dashboard.requestFailed);
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
  }, [selectedRunId, withAuth]);

  const handleTrigger = async (): Promise<void> => {
    setIsTriggering(true);
    setTriggerError(null);
    try {
      const result = await withAuth((idToken) => triggerManualSyncRun(idToken, dryRun));
      setSelectedRunId(result.runId);
      reloadRunsRef.current();
    } catch (error) {
      setTriggerError(error instanceof Error ? error.message : es.manualSync.triggerFailed);
    } finally {
      setIsTriggering(false);
    }
  };

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
          {es.manualSync.description}
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
              disabled={isTriggering}
              onClick={() => void handleTrigger()}
            >
              {isTriggering ? es.manualSync.triggering : es.manualSync.trigger}
            </Button>
            <FormControlLabel
              control={<Switch checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />}
              label={es.manualSync.dryRun}
            />
          </Box>
          {triggerError ? (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setTriggerError(null)}>
              {triggerError}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {selectedRunId ? (
        <Card variant="outlined">
          <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
            <Typography variant="h6" gutterBottom>
              {es.manualSync.liveDetail}
            </Typography>
            {manifestError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {manifestError}
              </Alert>
            ) : null}
            {manifest ? (
              <ManualSyncRunDetail manifest={manifest} />
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
        selectedRunId={selectedRunId}
        onSelect={setSelectedRunId}
        error={runs.error}
        isLoading={runs.isLoading}
      />
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
