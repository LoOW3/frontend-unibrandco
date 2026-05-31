import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

const TIENDANUBE_WORD = /^Tiendanube$/i;

/**
 * Tiendanube wordmark sized to match adjacent text (1em height).
 */
export function TiendanubeLogo() {
  return (
    <Box
      component="img"
      src="/assets/tienda-nube-logo.svg"
      alt="Tiendanube"
      sx={{
        height: '1em',
        width: 'auto',
        verticalAlign: '-0.15em',
        display: 'inline',
        mx: 0.25,
      }}
    />
  );
}

interface TiendanubeBrandTextProps {
  text: string;
}

/**
 * Renders plain text replacing "Tiendanube" with the inline logo.
 */
export function TiendanubeBrandText({ text }: TiendanubeBrandTextProps): ReactNode {
  return text.split(/(Tiendanube)/gi).map((part, index) =>
    TIENDANUBE_WORD.test(part) ? <TiendanubeLogo key={`tn-${index}`} /> : part,
  );
}
