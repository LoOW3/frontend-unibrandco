import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { triggerManualSync } from '../../lib/admin-api-client';
import { LastSyncMetrics } from './components/last-sync-metrics';
import { StockChangeDetailDialog } from './components/stock-change-detail-dialog';
import { StockChangesTable } from './components/stock-changes-table';
import { useAdminDashboard } from './hooks/use-admin-dashboard';
import { useAuthenticatedFetch } from './hooks/use-authenticated-fetch';
import { useStockChanges } from './hooks/use-stock-changes';
import { TiendanubeBrandText } from '../../components/tiendanube-brand';
import { es } from '../../i18n/es';

export function AdminDashboardPage() {
  const dashboard = useAdminDashboard();
  const stockChanges = useStockChanges();
  const { withAuth } = useAuthenticatedFetch();
  const [selectedSyncKey, setSelectedSyncKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isReloading = dashboard.isLoading || stockChanges.isLoading;

  const handleReload = (): void => {
    dashboard.reload();
    stockChanges.reload();
  };

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
      setSyncError(error instanceof Error ? error.message : es.dashboard.manualSyncFailed);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="min-w-0 text-2xl font-bold tracking-tight md:text-3xl">{es.dashboard.title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={es.dashboard.reload}
            onClick={handleReload}
            disabled={isReloading || isSyncing}
          >
            {isReloading ? <Spinner /> : <RefreshCw />}
          </Button>
          <Button disabled={isSyncing} onClick={() => void handleManualSync()}>
            {isSyncing ? <Spinner className="text-current" /> : <RefreshCw />}
            <span className="hidden sm:inline">
              {isSyncing ? es.dashboard.syncing : es.dashboard.manualSync}
            </span>
          </Button>
        </div>
      </div>

      {syncMessage ? (
        <Alert variant="success">
          <TiendanubeBrandText text={syncMessage} />
        </Alert>
      ) : null}
      {syncError ? <Alert variant="destructive">{syncError}</Alert> : null}

      <LastSyncMetrics data={dashboard.data} error={dashboard.error} isLoading={dashboard.isLoading} />

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
    </div>
  );
}
</content>
