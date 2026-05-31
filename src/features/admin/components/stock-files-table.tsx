import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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

import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime, formatFileSize } from '../../../lib/format';
import type { StockFileEntry } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';
import { StockFilesMobileList } from './stock-files-mobile-list';

interface StockFilesTableProps {
  files: StockFileEntry[];
  date: string;
  error: string | null;
  isLoading: boolean;
}

export function StockFilesTable({ files, date, error, isLoading }: StockFilesTableProps) {
  const isMobile = useIsMobile();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" gutterBottom>
          {es.stockFiles.snapshotsFor(date)}
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
          <StockFilesMobileList files={files} onDownloadError={setDownloadError} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{es.stockFiles.syncedAt}</TableCell>
                  <TableCell>{es.stockFiles.s3Key}</TableCell>
                  <TableCell align="right">{es.stockFiles.size}</TableCell>
                  <TableCell align="center">{es.stockFiles.download}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        {es.stockFiles.noFiles}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  files.map((file) => (
                    <TableRow key={file.s3Key}>
                      <TableCell>{formatDateTime(file.syncedAt)}</TableCell>
                      <TableCell>{file.s3Key}</TableCell>
                      <TableCell align="right">{formatFileSize(file.sizeBytes)}</TableCell>
                      <TableCell align="center">
                        <StockFileDownloadButton
                          syncKey={file.s3Key}
                          onError={setDownloadError}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
