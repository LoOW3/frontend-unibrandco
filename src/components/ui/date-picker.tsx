import { CalendarIcon } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';

import type { Matcher } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

dayjs.extend(utc);

const displayFormat = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A UTC-day (dayjs) → a local Date at that Y/M/D midnight (no tz shift for the calendar). */
function dayjsToDate(value: Dayjs): Date {
  return new Date(value.utc().year(), value.utc().month(), value.utc().date());
}

/** A calendar Date's Y/M/D → a UTC-midnight dayjs. */
function dateToDayjs(date: Date): Dayjs {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return dayjs.utc(`${y}-${m}-${d}`).startOf('day');
}

interface DatePickerProps {
  value: Dayjs;
  onChange: (value: Dayjs) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, minDate, maxDate, className, disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = dayjsToDate(value);

  const disabledMatchers: Matcher[] = [];
  if (minDate) {
    disabledMatchers.push({ before: dayjsToDate(minDate) });
  }
  if (maxDate) {
    disabledMatchers.push({ after: dayjsToDate(maxDate) });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn('w-full justify-start font-normal sm:w-[240px]', className)}
        >
          <CalendarIcon className="text-muted-foreground" />
          {displayFormat.format(value.utc().toDate())}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          disabled={disabledMatchers}
          onSelect={(date) => {
            if (date) {
              onChange(dateToDayjs(date));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
