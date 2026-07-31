import type { ReactNode } from 'react';

const TIENDANUBE_WORD = /^Tiendanube$/i;

/**
 * Tiendanube wordmark sized to match adjacent text (1em height).
 */
export function TiendanubeLogo() {
  return (
    <img
      src="/assets/tienda-nube-logo.svg"
      alt="Tiendanube"
      className="mx-0.5 inline h-[1em] w-auto align-[-0.15em]"
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
