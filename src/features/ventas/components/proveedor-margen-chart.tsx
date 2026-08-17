import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent } from '../../../lib/format';
import type { GoldMargenProveedor } from '../../../types/admin-api';

interface ProveedorMargenChartProps {
  title: string;
  items: GoldMargenProveedor[];
  noDataLabel: string;
}

interface TooltipPayloadEntry {
  payload: GoldMargenProveedor;
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
  const { margenPct, unidades } = payload[0].payload;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label}</p>
      <p className="tabular-nums text-muted-foreground">{formatPercent(margenPct)}</p>
      <p className="text-xs text-muted-foreground">{unidades.toLocaleString('es-AR')} unidades</p>
    </div>
  );
}

function truncateLabel(value: string, max = 22): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

export function ProveedorMargenChart({ title, items, noDataLabel }: ProveedorMargenChartProps) {
  const data = [...items].reverse(); // el mejor arriba (recharts vertical dibuja de abajo hacia arriba)
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
                  tickFormatter={(v: number) => formatPercent(v)}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={150}
                  tickFormatter={truncateLabel}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--muted)' }} />
                <Bar dataKey="margenPct" fill="var(--chart-4)" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
