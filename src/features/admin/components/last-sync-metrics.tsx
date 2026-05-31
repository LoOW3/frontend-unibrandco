import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { AdminDashboardResponse, TiendanubePatchedItem } from '../../../types/admin-api';

interface LastSyncMetricsProps {
  data: AdminDashboardResponse | null;
  error: string | null;
  isLoading: boolean;
}

function MetricItem({
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
    <Box>
      {tooltip ? (
        <LabelWithTooltip label={label} tooltip={tooltip} />
      ) : (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          ...(breakWords ? { wordBreak: 'break-all', fontSize: '0.875rem' } : {}),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function PatchedItemsMobileList({ items }: { items: TiendanubePatchedItem[] }) {
  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <Card key={item.sku} variant="outlined">
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {item.sku}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {es.metrics.previous}: {item.previousStock ?? '—'} · {es.metrics.new}: {item.newStock}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export function LastSyncMetrics({ data, error, isLoading }: LastSyncMetricsProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const lastSync = data?.lastTiendanubeSync;

  if (!lastSync) {
    return (
      <Alert severity="info">
        <TiendanubeBrandText text={es.metrics.noSyncYet} />
      </Alert>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Box sx={{ mb: 2 }}>
          <LabelWithTooltip
            label={es.metrics.lastTiendanubeSync}
            tooltip={es.tooltips.lastTiendanubeSync}
            variant="h6"
            color="text.primary"
          />
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              label={es.metrics.syncKey}
              tooltip={es.tooltips.syncKey}
              value={lastSync.syncKey}
              breakWords
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              label={es.metrics.syncedAtUtc}
              tooltip={es.tooltips.syncedAtUtc}
              value={formatDateTime(lastSync.syncedAt)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              label={es.metrics.patchedAtUtc}
              tooltip={es.tooltips.patchedAtUtc}
              value={formatDateTime(lastSync.patchedAt)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricItem
              label={es.metrics.patchedSkus}
              tooltip={es.tooltips.patchedSkus}
              value={lastSync.patchedCount}
            />
          </Grid>
        </Grid>

        {lastSync.patchedItems.length > 0 ? (
          isMobile ? (
            <PatchedItemsMobileList items={lastSync.patchedItems} />
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 400 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{es.metrics.sku}</TableCell>
                    <TableCell align="right">
                      <LabelWithTooltip
                        label={es.metrics.previousStock}
                        tooltip={es.tooltips.previousStock}
                        align="right"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <LabelWithTooltip
                        label={es.metrics.newStock}
                        tooltip={es.tooltips.newStock}
                        align="right"
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lastSync.patchedItems.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell align="right">{item.previousStock ?? '—'}</TableCell>
                      <TableCell align="right">{item.newStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            {es.metrics.noPatchedItems}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
