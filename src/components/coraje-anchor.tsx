import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import type { SxProps, Theme } from '@mui/material/styles';
import { useCallback, useState } from 'react';

import { es } from '../i18n/es';

const DEVELOPER_CONTACT_EMAIL = 'loow3.exe@gmail.com';

interface CorajeButtonProps {
  sx?: SxProps<Theme>;
}

/**
 * Clickable Coraje mascot that copies the developer contact email.
 */
export function CorajeButton({ sx }: CorajeButtonProps) {
  const [tooltipTitle, setTooltipTitle] = useState<string>(es.coraje.copyEmailTooltip);

  const handleCopyEmail = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(DEVELOPER_CONTACT_EMAIL);
      setTooltipTitle(es.coraje.emailCopied);
    } catch {
      setTooltipTitle(es.coraje.copyFailed);
    }
  }, []);

  const handleTooltipClose = useCallback((): void => {
    setTooltipTitle(es.coraje.copyEmailTooltip);
  }, []);

  return (
    <Tooltip title={tooltipTitle} arrow placement="left" onClose={handleTooltipClose}>
      <Box
        component="img"
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
        sx={{
          width: 72,
          height: 'auto',
          cursor: 'pointer',
          userSelect: 'none',
          ...sx,
        }}
      />
    </Tooltip>
  );
}

/** Fixed bottom-right anchor; hidden on mobile (shown in admin drawer instead). */
export function CorajeAnchor() {
  return (
    <CorajeButton
      sx={{
        position: 'fixed',
        bottom: { md: 16 },
        right: { md: 16 },
        width: { md: 96 },
        display: { xs: 'none', md: 'block' },
        zIndex: 1200,
      }}
    />
  );
}
