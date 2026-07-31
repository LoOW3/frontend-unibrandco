import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import { usePatagoniaPedidoDetail } from '../hooks/use-patagonia-pedido-detail';
import { PatagoniaPedidoStatusLabel, formatPatagoniaPedidoFulfillmentStatus } from './patagonia-pedido-status-label';

interface PatagoniaPedidoDetailDialogProps {
  codigo: string | null;
  open: boolean;
  onClose: () => void;
}

function DetailMetric({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: ReactNode;
  breakWords?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className={breakWords ? 'break-all text-sm' : 'text-sm'}>{value}</p>
    </div>
  );
}

export function PatagoniaPedidoDetailDialog({ codigo, open, onClose }: PatagoniaPedidoDetailDialogProps) {
  const isMobile = useIsMobile();
  const { data, error, isLoading } = usePatagoniaPedidoDetail(open ? codigo : null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent fullScreen={isMobile} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{es.pedidoDetailDialog.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-7" />
          </div>
        ) : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        {data ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailMetric label={es.pedidoDetailDialog.codigo} value={data.codigo} breakWords />
              <DetailMetric label={es.pedidoDetailDialog.tiendanubeOrderId} value={data.tiendanubeOrderId} />
              <DetailMetric label={es.pedidoDetailDialog.createdAt} value={formatDateTime(data.createdAt)} />
              <DetailMetric label={es.pedidoDetailDialog.itemCount} value={data.itemCount} />
              <DetailMetric
                label={es.pedidoDetailDialog.status}
                value={<PatagoniaPedidoStatusLabel status={data.status} fulfillmentStatus={data.fulfillmentStatus} />}
              />
              {data.fulfillmentStatus ? (
                <DetailMetric label={es.pedidoDetailDialog.fulfillmentStatus} value={formatPatagoniaPedidoFulfillmentStatus(data.fulfillmentStatus)} />
              ) : null}
              {data.shippedAt ? (
                <DetailMetric label={es.pedidoDetailDialog.shippedAt} value={formatDateTime(data.shippedAt)} />
              ) : null}
            </div>

            <Separator />
            <p className="text-sm font-semibold">
              <TiendanubeBrandText text={es.pedidoDetailDialog.tiendanubeSummary} />
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailMetric label={es.pedidoDetailDialog.customerName} value={data.summary.userData.name} />
              <DetailMetric label={es.pedidoDetailDialog.customerEmail} value={data.summary.userData.email} />
              <DetailMetric label={es.pedidoDetailDialog.customerPhone} value={data.summary.userData.phone} />
              <div className="sm:col-span-2">
                <DetailMetric label={es.pedidoDetailDialog.customerAddress} value={data.summary.userData.address} />
              </div>
            </div>

            <p className="text-sm font-medium">{es.pedidoDetailDialog.products}</p>
            <div className="max-h-60 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>{es.pedidoDetailDialog.sku}</TableHead>
                    <TableHead className="text-right">{es.pedidoDetailDialog.quantity}</TableHead>
                    <TableHead>{es.pedidoDetailDialog.variantId}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.summary.products.map((product) => (
                    <TableRow key={`${product.id}-${product.variant_id}`}>
                      <TableCell className="font-mono text-xs">{product.sku ?? '—'}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell>{product.variant_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />
            <p className="text-sm font-semibold">{es.pedidoDetailDialog.digipWms}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailMetric label={es.pedidoDetailDialog.codigo} value={data.createPedido.codigo} breakWords />
              <DetailMetric label={es.pedidoDetailDialog.fecha} value={data.createPedido.fecha} />
              <DetailMetric label={es.pedidoDetailDialog.estado} value={data.createPedido.estado} />
              <DetailMetric label={es.pedidoDetailDialog.clienteUbicacionCodigo} value={data.createPedido.clienteUbicacionCodigo} />
              {data.createPedido.observacion ? (
                <div className="sm:col-span-2">
                  <DetailMetric label={es.pedidoDetailDialog.observacion} value={data.createPedido.observacion} />
                </div>
              ) : null}
            </div>

            <div className="max-h-60 overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>{es.pedidoDetailDialog.linea}</TableHead>
                    <TableHead>{es.pedidoDetailDialog.articuloCodigo}</TableHead>
                    <TableHead className="text-right">{es.pedidoDetailDialog.unidades}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.createPedido.items.map((item) => (
                    <TableRow key={item.linea}>
                      <TableCell>{item.linea}</TableCell>
                      <TableCell className="font-mono text-xs">{item.articuloCodigo}</TableCell>
                      <TableCell className="text-right">{item.unidades}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
