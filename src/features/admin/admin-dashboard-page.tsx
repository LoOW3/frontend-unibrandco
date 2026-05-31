import RefreshIcon from '@mui/icons-material/Refresh';
import SyncIcon from '@mui/icons-material/Sync';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { triggerManualSync } from '../../lib/admin-api-client';
import { LastSyncMetrics } from './components/last-sync-metrics';
import { StockChangeDetailDialog } from './components/stock-change-detail-dialog';
import { StockChangesTable } from './components/stock-changes-table';
import { useAdminDashboard } from './hooks/use-admin-dashboard';
import { useAuthenticatedFetch } from './hooks/use-authenticated-fetch';
import { useStockChanges } from './hooks/use-stock-changes';
import { TiendanubeBrandText } from '../../components/tiendanube-brand';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { es } from '../../i18n/es';

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  const stockChanges = useStockChanges();
  const isMobile = useIsMobile();
  const { withAuth } = useAuthenticatedFetch();
  const [selectedSyncKey, setSelectedSyncKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleReload = (): void => {
    dashboard.reload();
    stockChanges.reload();
  };

  const isReloading = dashboard.isLoading || stockChanges.isLoading;

  const handleManualSync = async (): Promise<void> => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      const result = await withAuth((idToken) => triggerManualSync(idToken));
      setSyncMessage(es.dashboard.syncStarted(result.s3Key, result.itemCount));
      dashboard.reload();
      stockChanges.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : es.dashboard.manualSyncFailed;
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' }, minWidth: 0 }}
        >
          {es.dashboard.title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: 1,
          }}
        >
          <IconButton
            aria-label={es.dashboard.reload}
            onClick={handleReload}
            disabled={isReloading || isSyncing}
          >
            {isReloading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
          {isMobile ? (
            <Tooltip title={es.dashboard.manualSync}>
              <span>
                <IconButton
                  aria-label={es.dashboard.manualSync}
                  color="primary"
                  disabled={isSyncing}
                  onClick={() => void handleManualSync()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                  }}
                >
                  {isSyncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              startIcon={isSyncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
              disabled={isSyncing}
              onClick={() => void handleManualSync()}
            >
              {isSyncing ? es.dashboard.syncing : es.dashboard.manualSync}
            </Button>
          )}
        </Box>
      </Box>

      {syncMessage ? (
        <Alert severity="success">
          <TiendanubeBrandText text={syncMessage} />
        </Alert>
      ) : null}
      {syncError ? <Alert severity="error">{syncError}</Alert> : null}

      <LastSyncMetrics
        data={dashboard.data}
        error={dashboard.error}
        isLoading={dashboard.isLoading}
      />

      <StockChangesTable
        items={stockChanges.data?.items ?? []}
        error={stockChanges.error}
        isLoading={stockChanges.isLoading}
        hasNext={stockChanges.hasNext}
        hasPrevious={stockChanges.hasPrevious}
        onNext={stockChanges.goNext}
        onPrevious={stockChanges.goPrevious}
        onRowClick={setSelectedSyncKey}
      />

      <StockChangeDetailDialog
        syncKey={selectedSyncKey}
        open={Boolean(selectedSyncKey)}
        onClose={() => setSelectedSyncKey(null)}
      />
    </Box>
  );
}
