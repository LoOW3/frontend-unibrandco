import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { es } from '../../i18n/es';
import { GoldClientesTable } from './components/gold-clientes-table';
import { GoldFletesTable } from './components/gold-fletes-table';
import { GoldSummaryView } from './components/gold-summary';
import { GoldVentasTable } from './components/gold-ventas-table';
import { useGoldClientes } from './hooks/use-gold-clientes';
import { useGoldFletes } from './hooks/use-gold-fletes';
import { useGoldSummary } from './hooks/use-gold-summary';
import { useGoldVentas } from './hooks/use-gold-ventas';

const ALL = '__all__';
const CANALES = ['Mayorista', 'Mercado Libre', 'Tienda Nube'];
const CATEGORIAS = ['A', 'B1', 'B2', 'C'];

export function DashboardPage() {
  const [canal, setCanal] = useState<string>(ALL);
  const [categoria, setCategoria] = useState<string>(ALL);

  const ventasFilters = useMemo(() => ({ canal: canal === ALL ? undefined : canal }), [canal]);

  const summary = useGoldSummary();
  const ventas = useGoldVentas(ventasFilters);
  const clientes = useGoldClientes(categoria === ALL ? undefined : categoria);
  const fletes = useGoldFletes();

  const isReloading = summary.isLoading || ventas.isLoading || clientes.isLoading || fletes.isLoading;

  const handleReload = (): void => {
    summary.reload();
    ventas.reload();
    clientes.reload();
    fletes.reload();
  };

  const handleCanalChange = (value: string): void => {
    setCanal(value);
    ventas.resetToFirstPage();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{es.gold.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{es.gold.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={es.gold.reload}
          onClick={handleReload}
          disabled={isReloading}
        >
          {isReloading ? <Spinner /> : <RefreshCw />}
        </Button>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumen">{es.gold.tabResumen}</TabsTrigger>
          <TabsTrigger value="ventas">{es.gold.tabVentas}</TabsTrigger>
          <TabsTrigger value="clientes">{es.gold.tabClientes}</TabsTrigger>
          <TabsTrigger value="flete">{es.gold.tabFlete}</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <GoldSummaryView data={summary.data} error={summary.error} isLoading={summary.isLoading} />
        </TabsContent>

        <TabsContent value="ventas">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{es.gold.canal}</span>
            <Select value={canal} onValueChange={handleCanalChange}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{es.gold.filterAll}</SelectItem>
                {CANALES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <GoldVentasTable
            items={ventas.data?.items ?? []}
            error={ventas.error}
            isLoading={ventas.isLoading}
            hasNext={ventas.hasNext}
            hasPrevious={ventas.hasPrevious}
            onNext={ventas.goNext}
            onPrevious={ventas.goPrevious}
          />
        </TabsContent>

        <TabsContent value="clientes">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{es.gold.categoria}</span>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{es.gold.filterAll}</SelectItem>
                {CATEGORIAS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <GoldClientesTable
            items={clientes.data?.items ?? []}
            error={clientes.error}
            isLoading={clientes.isLoading}
            hasNext={clientes.hasNext}
            hasPrevious={clientes.hasPrevious}
            onNext={clientes.goNext}
            onPrevious={clientes.goPrevious}
          />
        </TabsContent>

        <TabsContent value="flete">
          <GoldFletesTable
            items={fletes.data?.items ?? []}
            error={fletes.error}
            isLoading={fletes.isLoading}
            hasNext={fletes.hasNext}
            hasPrevious={fletes.hasPrevious}
            onNext={fletes.goNext}
            onPrevious={fletes.goPrevious}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
