import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatCurrency, formatDateTime } from '../../../lib/format';
import type { GoldFleteLinea } from '../../../types/admin-api';

interface GoldFletesTableProps {
  items: GoldFleteLinea[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

function RealBadge({ real }: { real: boolean }) {
  return <Badge variant={real ? 'success' : 'muted'}>{real ? es.gold.fleteReal : es.gold.fleteEstimado}</Badge>;
}

export function GoldFletesTable({ items, error, isLoading, hasNext, hasPrevious, onNext, onPrevious }: GoldFletesTableProps) {
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
        {items.map((flete) => (
          <Card key={flete.claveFila}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm">{flete.sku}</span>
                <RealBadge real={flete.tieneFleteReal} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {es.gold.nroOrden}: {flete.nroOrden} · {es.gold.fleteProrrateado}: {formatCurrency(flete.fleteProrrateado)}
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
            <TableHead>{es.gold.nroOrden}</TableHead>
            <TableHead>{es.gold.sku}</TableHead>
            <TableHead>{es.gold.claveFila}</TableHead>
            <TableHead className="text-right">{es.gold.fleteProrrateado}</TableHead>
            <TableHead>{es.gold.tieneFleteReal}</TableHead>
            <TableHead>{es.gold.fechaCalculo}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((flete) => (
            <TableRow key={flete.claveFila}>
              <TableCell className="whitespace-nowrap">{flete.nroOrden}</TableCell>
              <TableCell className="font-mono text-xs">{flete.sku}</TableCell>
              <TableCell className="font-mono text-xs">{flete.claveFila}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(flete.fleteProrrateado)}</TableCell>
              <TableCell>
                <RealBadge real={flete.tieneFleteReal} />
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDateTime(flete.fechaCalculo)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pager}
    </div>
  );
}
