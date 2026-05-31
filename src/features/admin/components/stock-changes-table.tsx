import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { StockChangeSummary } from '../../../types/admin-api';
import { StockChangesMobileList } from './stock-changes-mobile-list';
import { StockFileDownloadButton } from './stock-file-download-button';

interface StockChangesTableProps {
  items: StockChangeSummary[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (syncKey: string) => void;
}

export function StockChangesTable({
  items,
  error,
  isLoading,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: StockChangesTableProps) {
  const isMobile = useIsMobile();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" gutterBottom>
          {es.stockChanges.title}
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {downloadError ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDownloadError(null)}>
            {downloadError}
          </Alert>
        ) : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isMobile ? (
          <StockChangesMobileList
            items={items}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={onNext}
            onPrevious={onPrevious}
            onRowClick={onRowClick}
            onDownloadError={setDownloadError}
          />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{es.stockChanges.syncedAt}</TableCell>
                    <TableCell align="right">
                      <LabelWithTooltip
                        label={es.stockChanges.changed}
                        tooltip={es.tooltips.changed}
                        align="right"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <LabelWithTooltip
                        label={es.stockChanges.patched}
                        tooltip={es.tooltips.patched}
                        align="right"
                      />
                    </TableCell>
                    <TableCell>{es.stockChanges.createdAt}</TableCell>
                    <TableCell align="center">{es.stockChanges.download}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          {es.stockChanges.noChanges}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item.pk}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => onRowClick(item.currentSyncKey)}
                      >
                        <TableCell>{formatDateTime(item.syncedAt)}</TableCell>
                        <TableCell align="right">{item.changedCount}</TableCell>
                        <TableCell align="right">
                          {item.tiendanubeSync?.patchedCount ?? '—'}
                        </TableCell>
                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                          <StockFileDownloadButton
                            syncKey={item.currentSyncKey}
                            onError={setDownloadError}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" disabled={!hasPrevious} onClick={onPrevious}>
                {es.stockChanges.previousPage}
              </Button>
              <Button variant="outlined" disabled={!hasNext} onClick={onNext}>
                {es.stockChanges.nextPage}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
