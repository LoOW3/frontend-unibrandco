import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { ManualSyncRunSummary } from '../../../types/admin-api';
import { manualSyncStatusChip } from './manual-sync-run-detail';

/** Returns the run-N label from a runId like manual-sync/2026/07/01/run-3. */
function runLabel(runId: string): string {
  return runId.split('/').pop() ?? runId;
}

interface ManualSyncRunsTableProps {
  runs: ManualSyncRunSummary[];
  date: string;
  selectedRunId: string | null;
  onSelect: (runId: string) => void;
  error: string | null;
  isLoading: boolean;
}

export function ManualSyncRunsTable({
  runs,
  date,
  selectedRunId,
  onSelect,
  error,
  isLoading,
}: ManualSyncRunsTableProps) {
  const isMobile = useIsMobile();

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" gutterBottom>
          {es.manualSync.runsFor(date)}
        </Typography>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : runs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {es.manualSync.noRuns}
          </Typography>
        ) : isMobile ? (
          <Stack spacing={1}>
            {runs.map((run) => {
              const chip = manualSyncStatusChip(run.status);
              return (
                <Card
                  key={run.runId}
                  variant="outlined"
                  sx={{
                    borderColor: run.runId === selectedRunId ? 'primary.main' : undefined,
                  }}
                >
                  <CardActionArea onClick={() => onSelect(run.runId)} sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2">{runLabel(run.runId)}</Typography>
                      <Chip size="small" color={chip.color} label={chip.label} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(run.startedAt)} · {run.progress}%
                    </Typography>
                  </CardActionArea>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{es.manualSync.run}</TableCell>
                  <TableCell>{es.manualSync.status}</TableCell>
                  <TableCell>{es.manualSync.startedAt}</TableCell>
                  <TableCell align="right">{es.manualSync.progress}</TableCell>
                  <TableCell align="right">{es.manualSync.countPatched}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((run) => {
                  const chip = manualSyncStatusChip(run.status);
                  return (
                    <TableRow
                      key={run.runId}
                      hover
                      selected={run.runId === selectedRunId}
                      onClick={() => onSelect(run.runId)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {runLabel(run.runId)}
                        {run.dryRun ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={es.manualSync.dryRunTag}
                            sx={{ ml: 1 }}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={chip.color} label={chip.label} />
                      </TableCell>
                      <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                      <TableCell align="right">{run.progress}%</TableCell>
                      <TableCell align="right">{run.counts.patched ?? '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
