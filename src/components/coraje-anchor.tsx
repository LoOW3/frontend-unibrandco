import { useCallback, useState } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { es } from '../i18n/es';

const DEVELOPER_CONTACT_EMAIL = 'loow3.exe@gmail.com';

interface CorajeButtonProps {
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Clickable Coraje mascot that copies the developer contact email.
 */
export function CorajeButton({ className, side = 'left' }: CorajeButtonProps) {
  const [title, setTitle] = useState<string>(es.coraje.copyEmailTooltip);

  const handleCopyEmail = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(DEVELOPER_CONTACT_EMAIL);
      setTitle(es.coraje.emailCopied);
    } catch {
      setTitle(es.coraje.copyFailed);
    }
  }, []);

  return (
    <Tooltip onOpenChange={(open) => !open && setTitle(es.coraje.copyEmailTooltip)}>
      <TooltipTrigger asChild>
        <img
          src="/assets/coraje.png"
          alt=""
          role="button"
          tabIndex={0}
          aria-label={es.coraje.ariaLabel}
          onClick={() => void handleCopyEmail()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              void handleCopyEmail();
            }
          }}
          className={cn('h-auto w-[72px] cursor-pointer select-none', className)}
        />
      </TooltipTrigger>
      <TooltipContent side={side}>{title}</TooltipContent>
    </Tooltip>
  );
}

/** Fixed bottom-right anchor; hidden on mobile (shown in admin drawer instead). */
export function CorajeAnchor() {
  return (
    <CorajeButton
      side="left"
      className="fixed bottom-4 right-4 z-[1200] hidden w-10 md:block"
    />
  );
}
