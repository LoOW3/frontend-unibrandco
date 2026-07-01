import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { es } from '../../i18n/es';
import { inviteUser, listUsers } from '../../lib/admin-api-client';
import type { AdminUser, UsersListResponse } from '../../types/admin-api';
import { UserDetailDialog } from './components/user-detail-dialog';
import { useAsyncData, useAuthenticatedFetch } from './hooks/use-authenticated-fetch';

function statusLabel(user: AdminUser): string {
  if (!user.enabled) {
    return es.users.disabled;
  }
  return user.status === 'FORCE_CHANGE_PASSWORD' ? es.users.pending : es.users.active;
}

function InviteDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: () => void;
}) {
  const { withAuth } = useAuthenticatedFetch();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = (): void => {
    setEmail('');
    setName('');
    setJobRole('');
    setError(null);
  };

  const handleInvite = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await withAuth((idToken) =>
        inviteUser(idToken, {
          email: email.trim(),
          name: name.trim() || undefined,
          jobRole: jobRole.trim() || undefined,
        }),
      );
      reset();
      onInvited();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : es.users.inviteFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{es.users.inviteTitle}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label={es.users.inviteEmail}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          size="small"
          fullWidth
          autoFocus
        />
        <TextField
          label={es.users.inviteName}
          value={name}
          onChange={(event) => setName(event.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label={es.users.inviteJobRole}
          value={jobRole}
          onChange={(event) => setJobRole(event.target.value)}
          size="small"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {es.users.cancel}
        </Button>
        <Button
          variant="contained"
          disabled={busy || !email.trim()}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={() => void handleInvite()}
        >
          {busy ? es.users.inviting : es.users.inviteSend}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UsersPage() {
  const users = useAsyncData<UsersListResponse>((withAuth) => withAuth((idToken) => listUsers(idToken)), []);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailEmail, setDetailEmail] = useState<string | null>(null);

  const rows = users.data?.users ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {es.users.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddOutlinedIcon />}
          onClick={() => setInviteOpen(true)}
        >
          {es.users.invite}
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {users.error ? <Alert severity="error" sx={{ mb: 2 }}>{users.error}</Alert> : null}
          {users.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              {es.users.noUsers}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{es.users.name}</TableCell>
                    <TableCell>{es.users.email}</TableCell>
                    <TableCell>{es.users.jobRole}</TableCell>
                    <TableCell>{es.users.role}</TableCell>
                    <TableCell>{es.users.status}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((user) => (
                    <TableRow
                      key={user.email}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setDetailEmail(user.email)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                            {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                          </Avatar>
                          {user.name ?? '—'}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.jobRole ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={user.role === 'SUPER_ADMIN' ? 'secondary' : 'default'}
                          label={es.roles[user.role]}
                        />
                      </TableCell>
                      <TableCell>{statusLabel(user)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={() => users.reload()}
      />

      <UserDetailDialog
        email={detailEmail}
        open={Boolean(detailEmail)}
        onClose={() => setDetailEmail(null)}
        onChanged={() => users.reload()}
      />
    </Box>
  );
}
