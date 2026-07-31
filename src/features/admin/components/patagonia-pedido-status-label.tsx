import { cn } from '@/lib/cn';
import { es } from '../../../i18n/es';
import type {
  PatagoniaPedidoFulfillmentStatus,
  PatagoniaPedidoStatus,
} from '../../../types/admin-api';

/**
 * Maps API fulfillment status to a localized label.
 */
export function formatPatagoniaPedidoFulfillmentStatus(
  fulfillmentStatus: PatagoniaPedidoFulfillmentStatus,
): string {
  if (fulfillmentStatus === 'PACKED') {
    return es.pedidos.statusPacked;
  }
  return es.pedidos.statusDispatchedLegacy;
}

/**
 * Maps API pedido status to a localized label, using fulfillment when available.
 */
export function formatPatagoniaPedidoStatus(
  status: PatagoniaPedidoStatus,
  fulfillmentStatus?: PatagoniaPedidoFulfillmentStatus,
): string {
  if (status === 'pending') {
    return es.pedidos.statusPending;
  }
  if (fulfillmentStatus) {
    return formatPatagoniaPedidoFulfillmentStatus(fulfillmentStatus);
  }
  return es.pedidos.statusShipped;
}

interface PatagoniaPedidoStatusLabelProps {
  status: PatagoniaPedidoStatus;
  fulfillmentStatus?: PatagoniaPedidoFulfillmentStatus;
}

/** Renders a pedido status with semantic color. */
export function PatagoniaPedidoStatusLabel({ status, fulfillmentStatus }: PatagoniaPedidoStatusLabelProps) {
  const isShipped = status === 'shipped';
  return (
    <span className={cn('text-sm', isShipped ? 'font-semibold text-success' : 'text-muted-foreground')}>
      {formatPatagoniaPedidoStatus(status, fulfillmentStatus)}
    </span>
  );
}
