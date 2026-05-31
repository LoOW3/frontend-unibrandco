import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { formatDateTime, formatFileSize } from '../../../lib/format';
import { es } from '../../../i18n/es';
import type { StockFileEntry } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

interface StockFilesMobileListProps {
  files: StockFileEntry[];
  onDownloadError: (message: string) => void;
}

export function StockFilesMobileList({ files, onDownloadError }: StockFilesMobileListProps) {
  if (files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {es.stockFiles.noFiles}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {files.map((file) => (
        <Card key={file.s3Key} variant="outlined">
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {formatDateTime(file.syncedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(file.sizeBytes)}
                </Typography>
              </Box>
              <StockFileDownloadButton syncKey={file.s3Key} onError={onDownloadError} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
