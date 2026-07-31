import 'react-day-picker/style.css';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, getDefaultClassNames, type DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/cn';

const capFormat = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });
const weekdayFormat = new Intl.DateTimeFormat('es', { weekday: 'short' });

export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  const d = getDefaultClassNames();
  return (
    <DayPicker
      className={cn('text-sm', className)}
      formatters={{
        formatCaption: (month) => {
          const label = capFormat.format(month);
          return label.charAt(0).toUpperCase() + label.slice(1);
        },
        formatWeekdayName: (day) => weekdayFormat.format(day).replace('.', ''),
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      classNames={{
        root: cn(d.root, 'p-1'),
        month_caption: cn(d.month_caption, 'flex items-center justify-center h-9 text-sm font-medium'),
        nav: cn(d.nav, 'gap-1'),
        button_previous: cn(
          d.button_previous,
          'inline-flex items-center justify-center size-7 rounded-md border border-input hover:bg-accent',
        ),
        button_next: cn(
          d.button_next,
          'inline-flex items-center justify-center size-7 rounded-md border border-input hover:bg-accent',
        ),
        weekday: cn(d.weekday, 'text-xs font-normal text-muted-foreground'),
        day: cn(d.day, 'p-0'),
        day_button: cn(
          d.day_button,
          'size-8 rounded-md text-sm font-normal hover:bg-accent hover:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground',
        ),
        today: cn(d.today, 'font-semibold text-primary aria-selected:text-primary-foreground'),
        outside: cn(d.outside, 'text-muted-foreground opacity-50'),
        disabled: cn(d.disabled, 'opacity-40'),
        ...classNames,
      }}
      {...props}
    />
  );
}
