import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatCurrency, formatNumber } from '../../../lib/format';
import type { GoldVenta } from '../../../types/admin-api';

interface GoldVentasTableProps {
  items: GoldVenta[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

function Pager({ hasNext, hasPrevious, onNext, onPrevious }: Pick<GoldVentasTableProps, 'hasNext' | 'hasPrevious' | 'onNext' | 'onPrevious'>) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="outline" disabled={!hasPrevious} onClick={onPrevious}>
        {es.gold.previousPage}
      </Button>
      <Button variant="outline" disabled={!hasNext} onClick={onNext}>
        {es.gold.nextPage}
      </Button>
    </div>
  );
}

export function GoldVentasTable({ items, error, isLoading, hasNext, hasPrevious, onNext, onPrevious }: GoldVentasTableProps) {
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

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((venta, index) => (
          <Card key={`${venta.nroOrden}-${venta.sku}-${index}`}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm">{venta.sku}</span>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(venta.margenTotal)}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{venta.producto ?? '—'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {venta.canal} · {es.gold.cantidad} {formatNumber(venta.cantidad)} · {venta.fecha}
              </p>
              {venta.cliente ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{venta.cliente}</p> : null}
            </CardContent>
          </Card>
        ))}
        <Pager hasNext={hasNext} hasPrevious={hasPrevious} onNext={onNext} onPrevious={onPrevious} />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{es.gold.fecha}</TableHead>
            <TableHead>{es.gold.canal}</TableHead>
            <TableHead>{es.gold.sku}</TableHead>
            <TableHead>{es.gold.producto}</TableHead>
            <TableHead className="text-right">{es.gold.cantidad}</TableHead>
            <TableHead className="text-right">{es.gold.precioNeto}</TableHead>
            <TableHead className="text-right">{es.gold.margen}</TableHead>
            <TableHead>{es.gold.cliente}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((venta, index) => (
            <TableRow key={`${venta.nroOrden}-${venta.sku}-${index}`}>
              <TableCell className="whitespace-nowrap">{venta.fecha}</TableCell>
              <TableCell className="whitespace-nowrap">{venta.canal}</TableCell>
              <TableCell className="font-mono text-xs">{venta.sku}</TableCell>
              <TableCell className="max-w-[16rem] truncate">{venta.producto ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(venta.cantidad)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(venta.precioNeto)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(venta.margenTotal)}</TableCell>
              <TableCell className="max-w-[12rem] truncate">{venta.cliente ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pager hasNext={hasNext} hasPrevious={hasPrevious} onNext={onNext} onPrevious={onPrevious} />
    </div>
  );
}
