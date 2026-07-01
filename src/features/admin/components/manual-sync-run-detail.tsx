import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime, formatFileSize } from '../../../lib/format';
import type { ManualSyncManifest, ManualSyncStatus } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

type ChipColor = 'default' | 'info' | 'success' | 'error';

export function manualSyncStatusChip(status: ManualSyncStatus): {
  label: string;
  color: ChipColor;
} {
  switch (status) {
    case 'RUNNING':
      return { label: es.manualSync.statusRunning, color: 'info' };
    case 'COMPLETED':
      return { label: es.manualSync.statusCompleted, color: 'success' };
    case 'FAILED':
      return { label: es.manualSync.statusFailed, color: 'error' };
    default:
      return { label: es.manualSync.statusPending, color: 'default' };
  }
}

/** Index of the first step that is not COMPLETED (or the count if all done). */
function activeStepIndex(manifest: ManualSyncManifest): number {
  const index = manifest.steps.findIndex((step) => step.status !== 'COMPLETED');
  return index === -1 ? manifest.steps.length : index;
}

function CountsRow({ manifest }: { manifest: ManualSyncManifest }) {
  const { counts } = manifest;
  const entries: Array<[string, number | undefined]> = [
    [es.manualSync.countPatagonia, counts.patagoniaItems],
    [es.manualSync.countTnProducts, counts.tnProducts],
    [es.manualSync.countMatched, counts.matched],
    [es.manualSync.countSkipped, counts.skipped],
    [es.manualSync.countPatched, counts.patched],
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {entries
        .filter(([, value]) => value !== undefined)
        .map(([label, value]) => (
          <Chip key={label} size="small" variant="outlined" label={`${label}: ${value}`} />
        ))}
    </Box>
  );
}

interface ManualSyncRunDetailProps {
  manifest: ManualSyncManifest;
  onDownloadError?: (message: string) => void;
}

export function ManualSyncRunDetail({ manifest, onDownloadError }: ManualSyncRunDetailProps) {
  const isMobile = useIsMobile();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const chip = manualSyncStatusChip(manifest.status);
  const active = activeStepIndex(manifest);

  const handleDownloadError = (message: string) => {
    setDownloadError(message);
    onDownloadError?.(message);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {manifest.runId}
        </Typography>
        <Chip size="small" color={chip.color} label={chip.label} />
        {manifest.dryRun ? (
          <Chip size="small" variant="outlined" label={es.manualSync.dryRunTag} />
        ) : null}
      </Box>

      <Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, manifest.progress))}
          color={manifest.status === 'FAILED' ? 'error' : 'primary'}
        />
        <Typography variant="caption" color="text.secondary">
          {manifest.progress}%
          {manifest.currentStep
            ? ` — ${es.manualSync.currentStep(
                manifest.steps.find((step) => step.key === manifest.currentStep)?.label ??
                  manifest.currentStep,
              )}`
            : ''}
        </Typography>
      </Box>

      {manifest.error ? <Alert severity="error">{manifest.error}</Alert> : null}
      {downloadError ? (
        <Alert severity="error" onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      ) : null}

      <Stepper
        activeStep={active}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        alternativeLabel={!isMobile}
      >
        {manifest.steps.map((step) => (
          <Step key={step.key} completed={step.status === 'COMPLETED'}>
            <StepLabel error={step.status === 'FAILED'}>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <CountsRow manifest={manifest} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {es.manualSync.artifacts}
        </Typography>
        {manifest.artifacts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {es.manualSync.noArtifacts}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {manifest.artifacts.map((artifact) => (
              <Box
                key={artifact.s3Key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {artifact.label} — {formatFileSize(artifact.sizeBytes)}
                </Typography>
                <StockFileDownloadButton syncKey={artifact.s3Key} onError={handleDownloadError} />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary">
        {es.manualSync.startedAt}: {formatDateTime(manifest.startedAt)}
        {manifest.completedAt
          ? ` · ${es.manualSync.completedAt}: ${formatDateTime(manifest.completedAt)}`
          : ''}
        {manifest.triggeredBy ? ` · ${es.manualSync.triggeredBy}: ${manifest.triggeredBy}` : ''}
      </Typography>
    </Box>
  );
}
