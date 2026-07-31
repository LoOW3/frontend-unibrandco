import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LabelWithTooltip } from '../../components/label-with-tooltip';
import { es } from '../../i18n/es';
import { PatagoniaPedidoDetailDialog } from './components/patagonia-pedido-detail-dialog';
import { PatagoniaPedidosTable } from './components/patagonia-pedidos-table';
import { usePatagoniaPedidos } from './hooks/use-patagonia-pedidos';

export function PatagoniaPedidosPage() {
  const pedidos = usePatagoniaPedidos();
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 text-xl font-semibold tracking-tight">{es.pedidos.title}</h1>
          <Button variant="ghost" size="icon" aria-label={es.pedidos.reload} onClick={() => pedidos.reload()} disabled={pedidos.isLoading}>
            {pedidos.isLoading ? <Spinner /> : <RefreshCw />}
          </Button>
        </div>
        <div className="mt-1">
          <LabelWithTooltip label={es.pedidos.description} tooltip={es.tooltips.pedidosDescription} />
        </div>
      </div>

      <PatagoniaPedidosTable
        items={pedidos.data?.items ?? []}
        error={pedidos.error}
        isLoading={pedidos.isLoading}
        hasNext={pedidos.hasNext}
        hasPrevious={pedidos.hasPrevious}
        onNext={pedidos.goNext}
        onPrevious={pedidos.goPrevious}
        onRowClick={setSelectedCodigo}
      />

      <PatagoniaPedidoDetailDialog
        codigo={selectedCodigo}
        open={Boolean(selectedCodigo)}
        onClose={() => setSelectedCodigo(null)}
      />
    </div>
  );
}
