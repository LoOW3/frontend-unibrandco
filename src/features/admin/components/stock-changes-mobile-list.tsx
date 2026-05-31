import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { formatDateTime } from '../../../lib/format';
import { es } from '../../../i18n/es';
import type { StockChangeSummary } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

interface StockChangesMobileListProps {
  items: StockChangeSummary[];
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (syncKey: string) => void;
  onDownloadError: (message: string) => void;
}

export function StockChangesMobileList({
  items,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
  onDownloadError,
}: StockChangesMobileListProps) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {es.stockChanges.noChanges}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Card key={item.pk} variant="outlined">
          <CardActionArea onClick={() => onRowClick(item.currentSyncKey)}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {formatDateTime(item.syncedAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <LabelWithTooltip
                      label={`${es.stockChanges.changed}:`}
                      tooltip={es.tooltips.changed}
                      variant="body2"
                    />{' '}
                    {item.changedCount} ·{' '}
                    <LabelWithTooltip
                      label={`${es.stockChanges.patched}:`}
                      tooltip={es.tooltips.patched}
                      variant="body2"
                    />{' '}
                    {item.tiendanubeSync?.patchedCount ?? '—'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {es.stockChanges.created(formatDateTime(item.createdAt))}
                  </Typography>
                </Box>
                <Box onClick={(event) => event.stopPropagation()}>
                  <StockFileDownloadButton
                    syncKey={item.currentSyncKey}
                    onError={onDownloadError}
                  />
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
        <Button variant="outlined" disabled={!hasPrevious} onClick={onPrevious} fullWidth>
          {es.stockChanges.previousPage}
        </Button>
        <Button variant="outlined" disabled={!hasNext} onClick={onNext} fullWidth>
          {es.stockChanges.nextPage}
        </Button>
      </Box>
    </Stack>
  );
}
