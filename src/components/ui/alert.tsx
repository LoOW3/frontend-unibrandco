import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

const alertVariants = cva(
  'relative flex w-full gap-2.5 rounded-md border px-4 py-3 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:mt-0.5',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive [&_svg]:text-destructive',
        success: 'border-success/30 bg-success/10 text-success [&_svg]:text-success',
        info: 'border-info/30 bg-info/10 text-info [&_svg]:text-info',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps extends ComponentProps<'div'>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('font-medium leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
