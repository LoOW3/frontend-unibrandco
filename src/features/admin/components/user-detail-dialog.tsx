import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import {
  deleteUser,
  getUser,
  setUserEnabled,
  updateUser,
} from '../../../lib/admin-api-client';
import type { AdminUser, UserRole } from '../../../types/admin-api';
import { useAuth } from '../../auth/use-auth';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';

interface UserDetailDialogProps {
  email: string | null;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function UserDetailDialog({ email, open, onClose, onChanged }: UserDetailDialogProps) {
  const isMobile = useIsMobile();
  const { isSuperAdmin } = useAuth();
  const { withAuth } = useAuthenticatedFetch();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const apply = (value: AdminUser): void => {
    setUser(value);
    setName(value.name ?? '');
    setJobRole(value.jobRole ?? '');
    setRole(value.role);
  };

  useEffect(() => {
    if (!open || !email) {
      setUser(null);
      setError(null);
      setConfirmDelete(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await withAuth((idToken) => getUser(idToken, email));
        if (!cancelled) {
          apply(result);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : es.users.actionFailed);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, email, withAuth]);

  const run = async (action: (idToken: string) => Promise<unknown>, close = false): Promise<void> => {
    if (!email) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await withAuth(action);
      onChanged();
      if (close) {
        onClose();
      } else {
        const refreshed = await withAuth((idToken) => getUser(idToken, email));
        apply(refreshed);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : es.users.actionFailed);
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = user
    ? !user.enabled
      ? es.users.disabled
      : user.status === 'FORCE_CHANGE_PASSWORD'
        ? es.users.pending
        : es.users.active
    : '';

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {es.users.detailTitle}
        <IconButton aria-label={es.users.cancel} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {!user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 56, height: 56 }}>
                {(user.name ?? user.email).slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{user.name ?? '—'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip size="small" label={statusLabel} sx={{ ml: 'auto' }} />
            </Box>

            {isSuperAdmin ? (
              <>
                <TextField
                  label={es.users.name}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label={es.users.jobRole}
                  value={jobRole}
                  onChange={(event) => setJobRole(event.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  select
                  label={es.users.role}
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="ADMIN">{es.roles.ADMIN}</MenuItem>
                  <MenuItem value="SUPER_ADMIN">{es.roles.SUPER_ADMIN}</MenuItem>
                </TextField>
              </>
            ) : (
              <>
                <Typography variant="body2">
                  {es.users.jobRole}: {user.jobRole ?? '—'}
                </Typography>
                <Chip size="small" label={es.roles[user.role]} />
              </>
            )}
          </>
        )}
      </DialogContent>

      {isSuperAdmin && user ? (
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color={user.enabled ? 'warning' : 'success'}
              disabled={busy}
              onClick={() => void run((idToken) => setUserEnabled(idToken, user.email, !user.enabled))}
            >
              {user.enabled ? es.users.disable : es.users.enable}
            </Button>
            <Button
              color="error"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              {es.users.delete}
            </Button>
          </Box>
          <Button
            variant="contained"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={() =>
              void run((idToken) =>
                updateUser(idToken, user.email, { name: name.trim(), jobRole: jobRole.trim(), role }),
              )
            }
          >
            {busy ? es.users.saving : es.users.save}
          </Button>
        </DialogActions>
      ) : null}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>{es.users.deleteConfirmTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {user ? es.users.deleteConfirmBody(user.email) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={busy}>
            {es.users.cancel}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy}
            onClick={() => {
              if (user) {
                void run((idToken) => deleteUser(idToken, user.email), true);
              }
            }}
          >
            {es.users.deleteConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
