import { Download } from 'lucide-react';
import { type MouseEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      onError?.(error instanceof Error ? error.message : es.download.failed);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={es.download.ariaLabel(syncKey)}
          disabled={isDownloading}
          onClick={(event) => void handleDownload(event)}
        >
          {isDownloading ? <Spinner /> : <Download />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{es.download.tooltip}</TooltipContent>
    </Tooltip>
  );
}
