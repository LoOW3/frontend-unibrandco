import { Alert } from '@/components/ui/alert';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatCurrency, formatNumber } from '../../../lib/format';
import type { GoldClienteClasificado } from '../../../types/admin-api';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/** Category → badge variant (A best → C). */
function categoriaVariant(categoria: string): BadgeVariant {
  switch (categoria) {
    case 'A':
      return 'success';
    case 'B1':
      return 'info';
    case 'B2':
      return 'warning';
    default:
      return 'muted';
  }
}

interface GoldClientesTableProps {
  items: GoldClienteClasificado[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

function facturacion(cliente: GoldClienteClasificado): string {
  const parts: string[] = [];
  if (cliente.compraFacturado) {
    parts.push(es.gold.facturado);
  }
  if (cliente.compraNoFacturado) {
    parts.push(es.gold.noFacturado);
  }
  return parts.join(' · ') || '—';
}

export function GoldClientesTable({ items, error, isLoading, hasNext, hasPrevious, onNext, onPrevious }: GoldClientesTableProps) {
  const isMobile = useIsMobile();

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-7" />
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{es.gold.noData}</p>;
  }

  const pager = (
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="outline" disabled={!hasPrevious} onClick={onPrevious}>
        {es.gold.previousPage}
      </Button>
      <Button variant="outline" disabled={!hasNext} onClick={onNext}>
        {es.gold.nextPage}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((cliente) => (
          <Card key={cliente.clienteId}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-medium">{cliente.nombre ?? cliente.clienteId}</span>
                <Badge variant={categoriaVariant(cliente.categoria)}>{cliente.categoria}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {es.gold.montoTotal}: {formatCurrency(cliente.montoTotal)} · {es.gold.cantidadTickets}:{' '}
                {formatNumber(cliente.cantidadTickets)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {cliente.provincia ?? '—'} · {facturacion(cliente)}
              </p>
            </CardContent>
          </Card>
        ))}
        {pager}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{es.gold.nombre}</TableHead>
            <TableHead>{es.gold.provincia}</TableHead>
            <TableHead>{es.gold.categoria}</TableHead>
            <TableHead className="text-right">{es.gold.ticketPromedio}</TableHead>
            <TableHead className="text-right">{es.gold.montoTotal}</TableHead>
            <TableHead className="text-right">{es.gold.cantidadTickets}</TableHead>
            <TableHead>{es.gold.facturado}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((cliente) => (
            <TableRow key={cliente.clienteId}>
              <TableCell className="max-w-[16rem] truncate">{cliente.nombre ?? cliente.clienteId}</TableCell>
              <TableCell className="whitespace-nowrap">{cliente.provincia ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={categoriaVariant(cliente.categoria)}>{cliente.categoria}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(cliente.ticketPromedio)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(cliente.montoTotal)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(cliente.cantidadTickets)}</TableCell>
              <TableCell className="whitespace-nowrap">{facturacion(cliente)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pager}
    </div>
  );
}
