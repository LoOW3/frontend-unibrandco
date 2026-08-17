import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../../../lib/format';
import type { GoldNamedTotal } from '../../../types/admin-api';

interface VentasRankingChartProps {
  title: string;
  items: GoldNamedTotal[];
  noDataLabel: string;
  color?: string;
}

interface TooltipPayloadEntry {
  value: number;
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
      <p className="tabular-nums text-muted-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/** Trunca nombres largos (marcas/clientes) para que no rompan el eje Y. */
function truncateLabel(value: string, max = 22): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function VentasRankingChart({
  title,
  items,
  noDataLabel,
  color = 'var(--chart-1)',
}: VentasRankingChartProps) {
  // El más vendido arriba: recharts en layout vertical dibuja de abajo hacia
  // arriba, así que invertimos el orden antes de pasarlo al gráfico.
  const data = [...items].reverse();
  const rowHeight = 32;
  const chartHeight = Math.max(data.length * rowHeight, 120);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{noDataLabel}</p>
        ) : (
          <div style={{ height: chartHeight }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  hide
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                  tickFormatter={truncateLabel}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="total" fill={color} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
