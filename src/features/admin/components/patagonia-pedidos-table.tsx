import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import type { PatagoniaPedidoListItem } from '../../../types/admin-api';
import { PatagoniaPedidoStatusLabel } from './patagonia-pedido-status-label';
import { PatagoniaPedidosMobileList } from './patagonia-pedidos-mobile-list';

interface PatagoniaPedidosTableProps {
  items: PatagoniaPedidoListItem[];
  error: string | null;
  isLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onRowClick: (codigo: string) => void;
}

export function PatagoniaPedidosTable({
  items,
  error,
  isLoading,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onRowClick,
}: PatagoniaPedidosTableProps) {
  const isMobile = useIsMobile();

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Typography variant="h6" gutterBottom>
          {es.pedidos.title}
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : isMobile ? (
          <PatagoniaPedidosMobileList
            items={items}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onNext={onNext}
            onPrevious={onPrevious}
            onRowClick={onRowClick}
          />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{es.pedidos.codigo}</TableCell>
                    <TableCell align="right">
                      <TiendanubeBrandText text={es.pedidos.tiendanubeOrderId} />
                    </TableCell>
                    <TableCell align="right">{es.pedidos.itemCount}</TableCell>
                    <TableCell>
                      <LabelWithTooltip
                        label={es.pedidos.status}
                        tooltip={es.tooltips.pedidosStatus}
                      />
                    </TableCell>
                    <TableCell>{es.pedidos.createdAt}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          {es.pedidos.noPedidos}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item.codigo}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => onRowClick(item.codigo)}
                      >
                        <TableCell>{item.codigo}</TableCell>
                        <TableCell align="right">{item.tiendanubeOrderId}</TableCell>
                        <TableCell align="right">{item.itemCount}</TableCell>
                        <TableCell>
                          <PatagoniaPedidoStatusLabel status={item.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button variant="outlined" disabled={!hasPrevious} onClick={onPrevious}>
                {es.pedidos.previousPage}
              </Button>
              <Button variant="outlined" disabled={!hasNext} onClick={onNext}>
                {es.pedidos.nextPage}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
