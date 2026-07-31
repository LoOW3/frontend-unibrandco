import type { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { TiendanubeBrandText } from './tiendanube-brand';

interface LabelWithTooltipProps {
  label: ReactNode;
  tooltip: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

function renderContent(content: ReactNode): ReactNode {
  return typeof content === 'string' ? <TiendanubeBrandText text={content} /> : content;
}

/**
 * A label with a dotted underline that shows an explanatory tooltip on hover.
 */
export function LabelWithTooltip({ label, tooltip, align = 'left', className }: LabelWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex cursor-help border-b border-dotted border-muted-foreground/50 text-xs text-muted-foreground',
            align === 'right' && 'justify-end text-right',
            align === 'center' && 'justify-center text-center',
            className,
          )}
        >
          {renderContent(label)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{renderContent(tooltip)}</TooltipContent>
    </Tooltip>
  );
}
