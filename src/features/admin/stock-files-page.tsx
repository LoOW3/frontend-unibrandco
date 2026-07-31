import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useState } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { listStockFiles } from '../../lib/admin-api-client';
import type { StockFilesResponse } from '../../types/admin-api';
import { StockFilesTable } from './components/stock-files-table';
import { useAsyncData } from './hooks/use-authenticated-fetch';
import { es } from '../../i18n/es';

dayjs.extend(utc);

function getUtcDateString(value: Dayjs): string {
  return value.utc().format('YYYY-MM-DD');
}

export function StockFilesPage() {
  const maxDate = dayjs.utc().startOf('day');
  const minDate = maxDate.subtract(7, 'day');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs.utc().startOf('day'));

  const loader = useCallback(
    (withAuth: <T>(fetcher: (idToken: string) => Promise<T>) => Promise<T>) =>
      withAuth((idToken) => listStockFiles(idToken, getUtcDateString(selectedDate))),
    [selectedDate],
  );

  const { data, error, isLoading } = useAsyncData<StockFilesResponse>(loader, [selectedDate]);
  const dateLabel = useMemo(() => getUtcDateString(selectedDate), [selectedDate]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{es.stockFiles.title}</h1>

      <div className="flex flex-col gap-1.5">
        <Label>{es.stockFiles.dateLabel}</Label>
        <DatePicker value={selectedDate} minDate={minDate} maxDate={maxDate} onChange={setSelectedDate} />
      </div>

      <StockFilesTable files={data?.files ?? []} date={dateLabel} error={error} isLoading={isLoading} />
    </div>
  );
}
