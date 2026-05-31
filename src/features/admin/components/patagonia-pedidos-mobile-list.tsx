import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { formatDateTime } from '../../../lib/format';
import { es } from '../../../i18n/es';
import type { PatagoniaPedidoListItem } from '../../../types/admin-api';
import { PatagoniaPedidoStatusLabel } from './patagonia-pedido-status-label';

interface PatagoniaPedidosMobileListProps {
  items: PatagoniaPedidoListItem[];
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (codigo: string) => void;
}

export function PatagoniaPedidosMobileList({
  items,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: PatagoniaPedidosMobileListProps) {
  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {es.pedidos.noPedidos}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <Card key={item.codigo} variant="outlined">
          <CardActionArea onClick={() => onRowClick(item.codigo)}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {item.codigo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <TiendanubeBrandText text={es.pedidos.tiendanubeOrderId} />: {item.tiendanubeOrderId}{' '}
                · {es.pedidos.itemCountLabel(item.itemCount)} · {es.pedidos.status}:{' '}
                <PatagoniaPedidoStatusLabel status={item.status} />
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                {es.pedidos.created(formatDateTime(item.createdAt))}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
        <Button variant="outlined" disabled={!hasPrevious} onClick={onPrevious} fullWidth>
          {es.pedidos.previousPage}
        </Button>
        <Button variant="outlined" disabled={!hasNext} onClick={onNext} fullWidth>
          {es.pedidos.nextPage}
        </Button>
      </Box>
    </Stack>
  );
}
