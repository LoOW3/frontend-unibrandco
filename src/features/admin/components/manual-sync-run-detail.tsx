import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepIcon, { type StepIconProps } from '@mui/material/StepIcon';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useState, type ElementType, type ReactNode } from 'react';

import { ActorBadge } from './actor-badge';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime, formatFileSize } from '../../../lib/format';
import type {
  ManualSyncManifest,
  ManualSyncStatus,
  ManualSyncStep,
} from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

type ChipColor = 'default' | 'info' | 'success' | 'error' | 'warning';

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
    case 'ABORTED':
      return { label: es.manualSync.statusAborted, color: 'warning' };
    default:
      return { label: es.manualSync.statusPending, color: 'default' };
  }
}

/** Localized step label (with inline Tiendanube logo), falling back to manifest. */
function stepLabelText(step: ManualSyncStep): string {
  return es.manualSync.stepLabels[step.key] ?? step.label;
}

/** Index of the first step that is not COMPLETED (or the count if all done). */
function activeStepIndex(manifest: ManualSyncManifest): number {
  const index = manifest.steps.findIndex((step) => step.status !== 'COMPLETED');
  return index === -1 ? manifest.steps.length : index;
}

function CountsRow({ manifest }: { manifest: ManualSyncManifest }) {
  const { counts } = manifest;
  const entries: Array<[ReactNode, number | undefined]> = [
    [es.manualSync.countPatagonia, counts.patagoniaItems],
    [<TiendanubeBrandText key="tn" text={es.manualSync.countTnProducts} />, counts.tnProducts],
    [es.manualSync.countMatched, counts.matched],
    [es.manualSync.countSkipped, counts.skipped],
    [es.manualSync.countPatched, counts.patched],
  ];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {entries
        .filter(([, value]) => value !== undefined)
        .map(([label, value], index) => (
          <Chip
            key={index}
            size="small"
            variant="outlined"
            label={
              <>
                {label}: {value}
              </>
            }
          />
        ))}
    </Box>
  );
}

/**
 * Sub-progress percentage for a step that reports it (fetch pages / send chunks),
 * or null when the step has no fine-grained progress.
 */
function stepProgressPct(step: ManualSyncStep, manifest: ManualSyncManifest): number | null {
  const { counts } = manifest;

  if (step.key === 'fetch-tiendanube' && counts.tnPagesTotal) {
    return Math.round(((counts.tnPagesFetched ?? 0) / counts.tnPagesTotal) * 100);
  }
  if (step.key === 'send-patch' && counts.sendChunksTotal) {
    return Math.round(((counts.sendChunksSent ?? 0) / counts.sendChunksTotal) * 100);
  }
  return null;
}

/**
 * Step icon: for a RUNNING step with sub-progress, a determinate circular
 * progress with a small percentage label below; otherwise the default icon.
 */
function StepProgressIcon({
  step,
  manifest,
  ...iconProps
}: StepIconProps & { step: ManualSyncStep; manifest: ManualSyncManifest }) {
  const pct = step.status === 'RUNNING' ? stepProgressPct(step, manifest) : null;

  if (pct === null) {
    return <StepIcon {...iconProps} />;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress variant="determinate" value={pct} size={24} thickness={4} />
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          mt: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
}

interface ManualSyncRunDetailProps {
  manifest: ManualSyncManifest;
  onDownloadError?: (message: string) => void;
  /** When provided and the run is RUNNING, shows an "Abortar" button. */
  onAbort?: () => void;
  aborting?: boolean;
}

export function ManualSyncRunDetail({
  manifest,
  onDownloadError,
  onAbort,
  aborting,
}: ManualSyncRunDetailProps) {
  const isMobile = useIsMobile();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const chip = manualSyncStatusChip(manifest.status);
  const active = activeStepIndex(manifest);
  const currentStep = manifest.steps.find((step) => step.key === manifest.currentStep);

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
        {onAbort && manifest.status === 'RUNNING' ? (
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={
              aborting ? <CircularProgress size={14} color="inherit" /> : <StopCircleOutlinedIcon />
            }
            disabled={aborting}
            onClick={onAbort}
            sx={{ ml: 'auto' }}
          >
            {aborting ? es.manualSync.aborting : es.manualSync.abort}
          </Button>
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
          {currentStep ? ` — ${es.manualSync.currentStep(stepLabelText(currentStep))}` : ''}
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
            <StepLabel
              error={step.status === 'FAILED'}
              slots={{
                stepIcon: ((iconProps: StepIconProps) => (
                  <StepProgressIcon {...iconProps} step={step} manifest={manifest} />
                )) as ElementType,
              }}
            >
              <LabelWithTooltip
                label={stepLabelText(step)}
                tooltip={es.manualSync.stepDescriptions[step.key] ?? ''}
                variant="body2"
                align={isMobile ? 'left' : 'center'}
                color="text.primary"
              />
            </StepLabel>
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          {es.manualSync.triggeredBy}:
        </Typography>
        <ActorBadge email={manifest.triggeredBy} />
      </Box>

      <Typography variant="caption" color="text.secondary">
        {es.manualSync.startedAt}: {formatDateTime(manifest.startedAt)}
        {manifest.completedAt
          ? ` · ${es.manualSync.completedAt}: ${formatDateTime(manifest.completedAt)}`
          : ''}
      </Typography>
    </Box>
  );
}
