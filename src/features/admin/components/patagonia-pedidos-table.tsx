import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { PatagoniaPedidoListItem } from '../../../types/admin-api';
import { PatagoniaPedidoStatusLabel } from './patagonia-pedido-status-label';
import { PatagoniaPedidosMobileList } from './patagonia-pedidos-mobile-list';

interface PatagoniaPedidosTableProps {
  items: PatagoniaPedidoListItem[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (codigo: string) => void;
}

export function PatagoniaPedidosTable({
  items,
  error,
  isLoading,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: PatagoniaPedidosTableProps) {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">{es.pedidos.title}</h2>

        {error ? <Alert variant="destructive" className="mb-4">{error}</Alert> : null}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : isMobile ? (
          <PatagoniaPedidosMobileList
            items={items}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={onNext}
            onPrevious={onPrevious}
            onRowClick={onRowClick}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{es.pedidos.codigo}</TableHead>
                  <TableHead className="text-right">
                    <TiendanubeBrandText text={es.pedidos.tiendanubeOrderId} />
                  </TableHead>
                  <TableHead className="text-right">{es.pedidos.itemCount}</TableHead>
                  <TableHead>
                    <LabelWithTooltip label={es.pedidos.status} tooltip={es.tooltips.pedidosStatus} />
                  </TableHead>
                  <TableHead>
                    <LabelWithTooltip label={es.pedidos.shippedAt} tooltip={es.tooltips.pedidosShippedAt} />
                  </TableHead>
                  <TableHead>{es.pedidos.createdAt}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-muted-foreground">
                      {es.pedidos.noPedidos}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.codigo} className="cursor-pointer" onClick={() => onRowClick(item.codigo)}>
                      <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                      <TableCell className="text-right">{item.tiendanubeOrderId}</TableCell>
                      <TableCell className="text-right">{item.itemCount}</TableCell>
                      <TableCell>
                        <PatagoniaPedidoStatusLabel status={item.status} fulfillmentStatus={item.fulfillmentStatus} />
                      </TableCell>
                      <TableCell>{item.shippedAt ? formatDateTime(item.shippedAt) : '—'}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" disabled={!hasPrevious} onClick={onPrevious}>
                {es.pedidos.previousPage}
              </Button>
              <Button variant="outline" disabled={!hasNext} onClick={onNext}>
                {es.pedidos.nextPage}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
