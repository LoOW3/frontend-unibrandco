import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { getManualSyncRun } from '../../../lib/admin-api-client';
import type { ManualSyncManifest } from '../../../types/admin-api';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { ManualSyncRunDetail } from './manual-sync-run-detail';

const POLL_INTERVAL_MS = 4000;

interface ManualSyncRunDetailDialogProps {
  runId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ManualSyncRunDetailDialog({ runId, open, onClose }: ManualSyncRunDetailDialogProps) {
  const isMobile = useIsMobile();
  const { withAuth } = useAuthenticatedFetch();
  const [manifest, setManifest] = useState<ManualSyncManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !runId) {
      setManifest(null);
      setError(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (): Promise<void> => {
      try {
        const result = await withAuth((idToken) => getManualSyncRun(idToken, runId));
        if (cancelled) {
          return;
        }
        setManifest(result);
        setError(null);
        if (result.status === 'RUNNING' || result.status === 'PENDING') {
          timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : es.dashboard.requestFailed);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    void poll();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, runId, withAuth]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="md">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        {es.manualSync.runDetailTitle}
        <IconButton aria-label={es.pedidoDetailDialog.close} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {manifest ? <ManualSyncRunDetail manifest={manifest} /> : null}
      </DialogContent>
    </Dialog>
  );
}
