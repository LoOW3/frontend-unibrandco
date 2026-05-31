import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { TiendanubeBrandText } from './tiendanube-brand';

interface LabelWithTooltipProps {
  label: ReactNode;
  tooltip: ReactNode;
  variant?: TypographyProps['variant'];
  align?: 'left' | 'right' | 'center';
  color?: TypographyProps['color'];
}

function renderContent(content: ReactNode): ReactNode {
  return typeof content === 'string' ? <TiendanubeBrandText text={content} /> : content;
}

/**
 * Renders a label with a dotted underline that shows an explanatory tooltip on hover.
 */
export function LabelWithTooltip({
  label,
  tooltip,
  variant = 'caption',
  align = 'left',
  color = 'text.secondary',
}: LabelWithTooltipProps) {
  return (
    <Tooltip title={renderContent(tooltip)} arrow placement="top">
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          textAlign: align,
          width: align === 'right' ? '100%' : undefined,
        }}
      >
        <Typography
          variant={variant}
          color={color}
          component="span"
          sx={{
            cursor: 'help',
            borderBottom: '1px dotted',
            borderColor: 'text.disabled',
          }}
        >
          {renderContent(label)}
        </Typography>
      </Box>
    </Tooltip>
  );
}
