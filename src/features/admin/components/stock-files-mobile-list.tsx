import { Card, CardContent } from '@/components/ui/card';
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
    return <p className="text-sm text-muted-foreground">{es.stockFiles.noFiles}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <Card key={file.s3Key}>
          <CardContent className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{formatDateTime(file.syncedAt)}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.sizeBytes)}</p>
            </div>
            <StockFileDownloadButton syncKey={file.s3Key} onError={onDownloadError} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
