import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import { useStockChangeDetail } from '../hooks/use-stock-change-detail';
import { ActorBadge } from './actor-badge';

interface StockChangeDetailDialogProps {
  syncKey: string | null;
  open: boolean;
  onClose: () => void;
}

function DetailMetric({
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
        variant="body2"
        sx={breakWords ? { wordBreak: 'break-all' } : undefined}
      >
        {value}
      </Typography>
    </Box>
  );
}

function getItemFlag(item: { new?: boolean; deleted?: boolean }): string {
  if (item.new) {
    return es.detailDialog.flagNew;
  }
  if (item.deleted) {
    return es.detailDialog.flagDeleted;
  }
  return es.detailDialog.flagChanged;
}

export function StockChangeDetailDialog({
  syncKey,
  open,
  onClose,
}: StockChangeDetailDialogProps) {
  const isMobile = useIsMobile();
  const { data, error, isLoading } = useStockChangeDetail(open ? syncKey : null);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {es.detailDialog.title}
        <IconButton aria-label={es.detailDialog.close} onClick={onClose}>
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

        {data ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.detailDialog.currentSyncKey}
                  value={data.currentSyncKey}
                  breakWords
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.detailDialog.previousSyncKey}
                  value={data.previousSyncKey}
                  breakWords
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailMetric
                  label={es.detailDialog.syncedAt}
                  value={formatDateTime(data.syncedAt)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailMetric
                  label={es.detailDialog.changedCount}
                  tooltip={es.tooltips.changedCount}
                  value={data.changedCount}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DetailMetric
                  label={es.detailDialog.createdAt}
                  value={formatDateTime(data.createdAt)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  {es.manualSync.triggeredBy}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <ActorBadge email={data.triggeredBy ?? null} />
                </Box>
              </Grid>
            </Grid>

            {data.tiendanubeSync ? (
              <>
                <Divider />
                <Typography variant="subtitle1">
                  <TiendanubeBrandText text={es.detailDialog.tiendanubeSync} />
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DetailMetric
                      label={es.detailDialog.patchedAt}
                      tooltip={es.tooltips.patchedAt}
                      value={formatDateTime(data.tiendanubeSync.patchedAt)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DetailMetric
                      label={es.detailDialog.patched}
                      tooltip={es.tooltips.patched}
                      value={data.tiendanubeSync.patchedCount}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DetailMetric
                      label={es.detailDialog.matched}
                      tooltip={es.tooltips.matched}
                      value={data.tiendanubeSync.matchedCount}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DetailMetric
                      label={es.detailDialog.skippedDeleted}
                      tooltip={es.tooltips.skippedDeleted}
                      value={data.tiendanubeSync.skippedDeleted}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DetailMetric
                      label={es.detailDialog.skippedNoSku}
                      tooltip={es.tooltips.skippedNoSku}
                      value={data.tiendanubeSync.skippedNoSku}
                    />
                  </Grid>
                </Grid>
              </>
            ) : null}

            <Divider />
            <LabelWithTooltip
              label={es.detailDialog.changedItems}
              tooltip={es.tooltips.changedItems}
              variant="subtitle1"
              color="text.primary"
            />
            <TableContainer sx={{ maxHeight: 280, overflowX: 'auto' }}>
              <Table size="small" stickyHeader sx={{ minWidth: 480 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{es.detailDialog.article}</TableCell>
                    <TableCell align="right">{es.detailDialog.available}</TableCell>
                    <TableCell align="right">{es.detailDialog.previous}</TableCell>
                    <TableCell>{es.detailDialog.flags}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.changedItems.map((item) => (
                    <TableRow key={item.CodigoArticulo}>
                      <TableCell>{item.CodigoArticulo}</TableCell>
                      <TableCell align="right">{item.UnidadesDisponibles}</TableCell>
                      <TableCell align="right">
                        {item.previousUnidadesDisponibles ?? '—'}
                      </TableCell>
                      <TableCell>{getItemFlag(item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {data.tiendanubeSync?.patchedItems.length ? (
              <>
                <Divider />
                <LabelWithTooltip
                  label={es.detailDialog.patchedItems}
                  tooltip={es.tooltips.patchedItems}
                  variant="subtitle1"
                  color="text.primary"
                />
                <TableContainer sx={{ maxHeight: 240, overflowX: 'auto' }}>
                  <Table size="small" stickyHeader sx={{ minWidth: 360 }}>
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
                      {data.tiendanubeSync.patchedItems.map((item) => (
                        <TableRow key={item.sku}>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell align="right">{item.previousStock ?? '—'}</TableCell>
                          <TableCell align="right">{item.newStock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : null}
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
