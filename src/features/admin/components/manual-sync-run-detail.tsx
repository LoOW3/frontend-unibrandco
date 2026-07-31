import { Ban, Check, CircleAlert, CircleCheck, Hourglass, RotateCw, StopCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { ActorBadge } from './actor-badge';
import { LabelWithTooltip } from '../../../components/label-with-tooltip';
import { TiendanubeBrandText } from '../../../components/tiendanube-brand';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { formatDateTime, formatFileSize } from '../../../lib/format';
import type { ManualSyncManifest, ManualSyncStatus, ManualSyncStep } from '../../../types/admin-api';
import { StockFileDownloadButton } from './stock-file-download-button';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function manualSyncStatusChip(status: ManualSyncStatus): {
  label: string;
  variant: BadgeVariant;
  icon: ReactNode;
} {
  switch (status) {
    case 'RUNNING':
      return { label: es.manualSync.statusRunning, variant: 'info', icon: <RotateCw /> };
    case 'COMPLETED':
      return { label: es.manualSync.statusCompleted, variant: 'success', icon: <CircleCheck /> };
    case 'FAILED':
      return { label: es.manualSync.statusFailed, variant: 'destructive', icon: <CircleAlert /> };
    case 'ABORTED':
      return { label: es.manualSync.statusAborted, variant: 'warning', icon: <Ban /> };
    default:
      return { label: es.manualSync.statusPending, variant: 'muted', icon: <Hourglass /> };
  }
}

function stepLabelText(step: ManualSyncStep): string {
  return es.manualSync.stepLabels[step.key] ?? step.label;
}

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

function ProgressRing({ pct }: { pct: number }) {
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" className="-rotate-90">
      <circle cx="15" cy="15" r={r} className="fill-none stroke-muted" strokeWidth="3" />
      <circle
        cx="15"
        cy="15"
        r={r}
        className="fill-none stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
    </svg>
  );
}

function StepCircle({ step, index, manifest }: { step: ManualSyncStep; index: number; manifest: ManualSyncManifest }) {
  const pct = step.status === 'RUNNING' ? stepProgressPct(step, manifest) : null;

  if (step.status === 'COMPLETED') {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-4" />
      </div>
    );
  }
  if (step.status === 'FAILED') {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
        <X className="size-4" />
      </div>
    );
  }
  if (step.status === 'RUNNING' && pct !== null) {
    return (
      <div className="relative flex items-center justify-center">
        <ProgressRing pct={pct} />
        <span className="absolute text-[0.55rem] font-medium text-primary">{pct}%</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
        step.status === 'RUNNING'
          ? 'border-primary text-primary'
          : 'border-muted-foreground/40 text-muted-foreground',
      )}
    >
      {index + 1}
    </div>
  );
}

function Stepper({ manifest }: { manifest: ManualSyncManifest }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {manifest.steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-3">
            <StepCircle step={step} index={index} manifest={manifest} />
            <LabelWithTooltip
              label={stepLabelText(step)}
              tooltip={es.manualSync.stepDescriptions[step.key] ?? ''}
              className="border-none text-sm text-foreground"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      {manifest.steps.map((step, index) => (
        <div key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
          <StepCircle step={step} index={index} manifest={manifest} />
          <LabelWithTooltip
            label={stepLabelText(step)}
            tooltip={es.manualSync.stepDescriptions[step.key] ?? ''}
            align="center"
            className="border-none text-xs text-foreground"
          />
        </div>
      ))}
    </div>
  );
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
    <div className="flex flex-wrap gap-2">
      {entries
        .filter(([, value]) => value !== undefined)
        .map(([label, value], index) => (
          <Badge key={index} variant="outline">
            {label}: {value}
          </Badge>
        ))}
    </div>
  );
}

interface ManualSyncRunDetailProps {
  manifest: ManualSyncManifest;
  onDownloadError?: (message: string) => void;
  onAbort?: () => void;
  aborting?: boolean;
}

export function ManualSyncRunDetail({ manifest, onDownloadError, onAbort, aborting }: ManualSyncRunDetailProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const chip = manualSyncStatusChip(manifest.status);
  const currentStep = manifest.steps.find((step) => step.key === manifest.currentStep);

  const handleDownloadError = (message: string) => {
    setDownloadError(message);
    onDownloadError?.(message);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-medium">{manifest.runId}</span>
        <Badge variant={chip.variant}>
          {chip.icon}
          {chip.label}
        </Badge>
        {manifest.dryRun ? <Badge variant="outline">{es.manualSync.dryRunTag}</Badge> : null}
        {onAbort && manifest.status === 'RUNNING' ? (
          <Button variant="outline" size="sm" className="ml-auto text-destructive" disabled={aborting} onClick={onAbort}>
            {aborting ? <Spinner className="text-current" /> : <StopCircle />}
            {aborting ? es.manualSync.aborting : es.manualSync.abort}
          </Button>
        ) : null}
      </div>

      <div>
        <Progress
          value={manifest.progress}
          indicatorClassName={manifest.status === 'FAILED' ? 'bg-destructive' : undefined}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {manifest.progress}%
          {currentStep ? ` — ${es.manualSync.currentStep(stepLabelText(currentStep))}` : ''}
        </p>
      </div>

      {manifest.error ? <Alert variant="destructive">{manifest.error}</Alert> : null}
      {downloadError ? <Alert variant="destructive">{downloadError}</Alert> : null}

      <Stepper manifest={manifest} />

      <CountsRow manifest={manifest} />

      <div>
        <p className="mb-1.5 text-sm font-medium">{es.manualSync.artifacts}</p>
        {manifest.artifacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es.manualSync.noArtifacts}</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {manifest.artifacts.map((artifact) => (
              <div key={artifact.s3Key} className="flex items-center justify-between gap-2">
                <span className="break-all text-sm">
                  {artifact.label} — {formatFileSize(artifact.sizeBytes)}
                </span>
                <StockFileDownloadButton syncKey={artifact.s3Key} onError={handleDownloadError} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{es.manualSync.triggeredBy}:</span>
        <ActorBadge email={manifest.triggeredBy} />
      </div>

      <p className="text-xs text-muted-foreground">
        {es.manualSync.startedAt}: {formatDateTime(manifest.startedAt)}
        {manifest.completedAt ? ` · ${es.manualSync.completedAt}: ${formatDateTime(manifest.completedAt)}` : ''}
      </p>
    </div>
  );
}
