import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { esES } from '@mui/x-date-pickers/locales';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import 'dayjs/locale/es';

import { listStockFiles } from '../../lib/admin-api-client';
import type { StockFilesResponse } from '../../types/admin-api';
import { StockFilesTable } from './components/stock-files-table';
import { useAsyncData } from './hooks/use-authenticated-fetch';
import { es } from '../../i18n/es';

dayjs.extend(utc);

function getUtcDateString(value: Dayjs): string {
  return value.utc().format('YYYY-MM-DD');
}

function StockFilesDateProvider({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="es"
      localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      {children}
    </LocalizationProvider>
  );
}

function StockFilesPageContent() {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}
      >
        {es.stockFiles.title}
      </Typography>

      <DatePicker
        label={es.stockFiles.dateLabel}
        value={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        timezone="UTC"
        onChange={(value) => {
          if (value) {
            setSelectedDate(value.utc().startOf('day'));
          }
        }}
        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { maxWidth: { sm: 280 } } } }}
      />

      <StockFilesTable
        files={data?.files ?? []}
        date={dateLabel}
        error={error}
        isLoading={isLoading}
      />
    </Box>
  );
}

export function StockFilesPage() {
  return (
    <StockFilesDateProvider>
      <StockFilesPageContent />
    </StockFilesDateProvider>
  );
}
