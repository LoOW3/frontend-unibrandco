import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime } from '../../../lib/format';
import { usePatagoniaPedidoDetail } from '../hooks/use-patagonia-pedido-detail';

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
  value: string | number;
  breakWords?: boolean;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={breakWords ? { wordBreak: 'break-all' } : undefined}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function PatagoniaPedidoDetailDialog({
  codigo,
  open,
  onClose,
}: PatagoniaPedidoDetailDialogProps) {
  const isMobile = useIsMobile();
  const { data, error, isLoading } = usePatagoniaPedidoDetail(open ? codigo : null);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {es.pedidoDetailDialog.title}
        <IconButton aria-label={es.pedidoDetailDialog.close} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : null}

        {error ? <Alert severity="error">{error}</Alert> : null}

        {data ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.codigo}
                  value={data.codigo}
                  breakWords
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.tiendanubeOrderId}
                  value={data.tiendanubeOrderId}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.createdAt}
                  value={formatDateTime(data.createdAt)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.itemCount}
                  value={data.itemCount}
                />
              </Grid>
            </Grid>

            <Divider />
            <Typography variant="subtitle1">
              <TiendanubeBrandText text={es.pedidoDetailDialog.tiendanubeSummary} />
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.customerName}
                  value={data.summary.userData.name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.customerEmail}
                  value={data.summary.userData.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.customerPhone}
                  value={data.summary.userData.phone}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.customerAddress}
                  value={data.summary.userData.address}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2">{es.pedidoDetailDialog.products}</Typography>
            <TableContainer sx={{ maxHeight: 240, overflowX: 'auto' }}>
              <Table size="small" stickyHeader sx={{ minWidth: 360 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{es.pedidoDetailDialog.sku}</TableCell>
                    <TableCell align="right">{es.pedidoDetailDialog.quantity}</TableCell>
                    <TableCell>{es.pedidoDetailDialog.variantId}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.summary.products.map((product) => (
                    <TableRow key={`${product.id}-${product.variant_id}`}>
                      <TableCell>{product.sku ?? '—'}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell>{product.variant_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            <Typography variant="subtitle1">{es.pedidoDetailDialog.digipWms}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.codigo}
                  value={data.createPedido.codigo}
                  breakWords
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.fecha}
                  value={data.createPedido.fecha}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.estado}
                  value={data.createPedido.estado}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailMetric
                  label={es.pedidoDetailDialog.clienteUbicacionCodigo}
                  value={data.createPedido.clienteUbicacionCodigo}
                />
              </Grid>
              {data.createPedido.observacion ? (
                <Grid size={{ xs: 12 }}>
                  <DetailMetric
                    label={es.pedidoDetailDialog.observacion}
                    value={data.createPedido.observacion}
                  />
                </Grid>
              ) : null}
            </Grid>

            <TableContainer sx={{ maxHeight: 240, overflowX: 'auto' }}>
              <Table size="small" stickyHeader sx={{ minWidth: 360 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{es.pedidoDetailDialog.linea}</TableCell>
                    <TableCell>{es.pedidoDetailDialog.articuloCodigo}</TableCell>
                    <TableCell align="right">{es.pedidoDetailDialog.unidades}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.createPedido.items.map((item) => (
                    <TableRow key={item.linea}>
                      <TableCell>{item.linea}</TableCell>
                      <TableCell>{item.articuloCodigo}</TableCell>
                      <TableCell align="right">{item.unidades}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
