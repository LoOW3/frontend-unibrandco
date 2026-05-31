import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { type MouseEvent, useState } from 'react';

import { downloadStockFile } from '../../../lib/admin-api-client';
import { es } from '../../../i18n/es';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';

interface StockFileDownloadButtonProps {
  syncKey: string;
  onError?: (message: string) => void;
}

export function StockFileDownloadButton({ syncKey, onError }: StockFileDownloadButtonProps) {
  const { withAuth } = useAuthenticatedFetch();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation();
    setIsDownloading(true);

    try {
      await withAuth((idToken) => downloadStockFile(idToken, syncKey));
    } catch (error) {
      const message = error instanceof Error ? error.message : es.download.failed;
      onError?.(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip title={es.download.tooltip}>
      <span>
        <IconButton
          aria-label={es.download.ariaLabel(syncKey)}
          size="small"
          disabled={isDownloading}
          onClick={(event) => void handleDownload(event)}
        >
          {isDownloading ? <CircularProgress size={18} /> : <DownloadIcon fontSize="small" />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
