import Typography from '@mui/material/Typography';

import { es } from '../../../i18n/es';
import type { PatagoniaPedidoStatus } from '../../../types/admin-api';

/**
 * Maps API pedido status to a localized label.
 */
export function formatPatagoniaPedidoStatus(status: PatagoniaPedidoStatus): string {
  return status === 'shipped' ? es.pedidos.statusShipped : es.pedidos.statusPending;
}

interface PatagoniaPedidoStatusLabelProps {
  status: PatagoniaPedidoStatus;
}

/** Renders a pedido status with semantic color. */
export function PatagoniaPedidoStatusLabel({ status }: PatagoniaPedidoStatusLabelProps) {
  const isShipped = status === 'shipped';

  return (
    <Typography
      variant="body2"
      component="span"
      sx={{
        color: isShipped ? 'success.main' : 'text.secondary',
        fontWeight: isShipped ? 600 : 400,
      }}
    >
      {formatPatagoniaPedidoStatus(status)}
    </Typography>
  );
}
