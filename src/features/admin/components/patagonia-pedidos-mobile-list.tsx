import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { formatDateTime } from '../../../lib/format';
import { es } from '../../../i18n/es';
import type { PatagoniaPedidoListItem } from '../../../types/admin-api';
import { PatagoniaPedidoStatusLabel } from './patagonia-pedido-status-label';

interface PatagoniaPedidosMobileListProps {
  items: PatagoniaPedidoListItem[];
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (codigo: string) => void;
}

export function PatagoniaPedidosMobileList({
  items,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: PatagoniaPedidosMobileListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{es.pedidos.noPedidos}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Card key={item.codigo}>
          <CardContent className="py-3">
            <button type="button" onClick={() => onRowClick(item.codigo)} className="w-full text-left">
              <p className="font-mono text-sm font-medium">{item.codigo}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <TiendanubeBrandText text={es.pedidos.tiendanubeOrderId} />: {item.tiendanubeOrderId} ·{' '}
                {es.pedidos.itemCountLabel(item.itemCount)} · {es.pedidos.status}:{' '}
                <PatagoniaPedidoStatusLabel status={item.status} fulfillmentStatus={item.fulfillmentStatus} />
              </p>
              {item.shippedAt ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {es.pedidos.shippedAt}: {formatDateTime(item.shippedAt)}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-muted-foreground">{es.pedidos.created(formatDateTime(item.createdAt))}</p>
            </button>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" disabled={!hasPrevious} onClick={onPrevious}>
          {es.pedidos.previousPage}
        </Button>
        <Button variant="outline" className="flex-1" disabled={!hasNext} onClick={onNext}>
          {es.pedidos.nextPage}
        </Button>
      </div>
    </div>
  );
}
