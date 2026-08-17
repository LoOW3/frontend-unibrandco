import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../../../lib/format';
import type { GoldFacturacionDiaVendedor } from '../../../types/admin-api';

interface VentasPorDiaVendedorChartProps {
  title: string;
  items: GoldFacturacionDiaVendedor[];
  noDataLabel: string;
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

const compactCurrencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Convierte [{fecha, vendedor, total}, ...] en filas por fecha con una
 * columna por vendedor, que es el formato que recharts necesita para
 * dibujar varias líneas (una serie por vendedor) en el mismo gráfico. */
function pivotearPorVendedor(items: GoldFacturacionDiaVendedor[]) {
  const vendedores = Array.from(new Set(items.map((i) => i.vendedor))).sort();
  const porFecha = new Map<string, Record<string, number | string>>();

  for (const { fecha, vendedor, total } of items) {
    const fila = porFecha.get(fecha) ?? { fecha };
    fila[vendedor] = total;
    porFecha.set(fecha, fila);
  }

  const data = Array.from(porFecha.values()).sort((a, b) =>
    String(a.fecha).localeCompare(String(b.fecha)),
  );

  return { data, vendedores };
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function VentasPorDiaVendedorChart({ title, items, noDataLabel }: VentasPorDiaVendedorChartProps) {
  const { data, vendedores } = useMemo(() => pivotearPorVendedor(items), [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{noDataLabel}</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => compactCurrencyFormatter.format(v)}
                  width={64}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
                {vendedores.map((vendedor, index) => (
                  <Line
                    key={vendedor}
                    type="monotone"
                    dataKey={vendedor}
                    name={vendedor}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
