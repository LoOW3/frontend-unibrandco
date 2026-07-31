import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">{es.stockFiles.snapshotsFor(date)}</h2>

        {error ? <Alert variant="destructive" className="mb-4">{error}</Alert> : null}
        {downloadError ? <Alert variant="destructive" className="mb-4">{downloadError}</Alert> : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : isMobile ? (
          <StockFilesMobileList files={files} onDownloadError={setDownloadError} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{es.stockFiles.syncedAt}</TableHead>
                <TableHead>{es.stockFiles.s3Key}</TableHead>
                <TableHead className="text-right">{es.stockFiles.size}</TableHead>
                <TableHead className="text-center">{es.stockFiles.download}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-muted-foreground">
                    {es.stockFiles.noFiles}
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.s3Key}>
                    <TableCell>{formatDateTime(file.syncedAt)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{file.s3Key}</TableCell>
                    <TableCell className="text-right">{formatFileSize(file.sizeBytes)}</TableCell>
                    <TableCell className="text-center">
                      <StockFileDownloadButton syncKey={file.s3Key} onError={setDownloadError} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
</content>
