import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { es } from '../../i18n/es';
import { PatagoniaPedidoDetailDialog } from './components/patagonia-pedido-detail-dialog';
import { PatagoniaPedidosTable } from './components/patagonia-pedidos-table';
import { usePatagoniaPedidos } from './hooks/use-patagonia-pedidos';

export function PatagoniaPedidosPage() {
  const pedidos = usePatagoniaPedidos();
  const [selectedCodigo, setSelectedCodigo] = useState<string | null>(null);

  const handleReload = (): void => {
    pedidos.reload();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' }, minWidth: 0 }}
        >
          {es.pedidos.title}
        </Typography>
        <IconButton
          aria-label={es.pedidos.reload}
          onClick={handleReload}
          disabled={pedidos.isLoading}
        >
          {pedidos.isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Box>

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
    </Box>
  );
}
