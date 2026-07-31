import { UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { es } from '../../i18n/es';
import { inviteUser, listUsers } from '../../lib/admin-api-client';
import type { AdminUser, UsersListResponse } from '../../types/admin-api';
import { UserDetailDialog } from './components/user-detail-dialog';
import { roleBadgeVariant, roleChipIcon, userStatusIcon, userStatusVariant } from './components/chip-visuals';
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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{es.users.inviteTitle}</DialogTitle>
        </DialogHeader>

        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-email">{es.users.inviteEmail}</Label>
          <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-name">{es.users.inviteName}</Label>
          <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-jobrole">{es.users.inviteJobRole}</Label>
          <Input id="invite-jobrole" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            {es.users.cancel}
          </Button>
          <Button disabled={busy || !email.trim()} onClick={() => void handleInvite()}>
            {busy ? <Spinner className="text-current" /> : null}
            {busy ? es.users.inviting : es.users.inviteSend}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersPage() {
  const users = useAsyncData<UsersListResponse>((withAuth) => withAuth((idToken) => listUsers(idToken)), []);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailEmail, setDetailEmail] = useState<string | null>(null);

  const rows = users.data?.users ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{es.users.title}</h1>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus />
          {es.users.invite}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          {users.error ? <Alert variant="destructive" className="mb-4">{users.error}</Alert> : null}
          {users.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-7" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{es.users.noUsers}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{es.users.name}</TableHead>
                  <TableHead>{es.users.email}</TableHead>
                  <TableHead>{es.users.jobRole}</TableHead>
                  <TableHead>{es.users.role}</TableHead>
                  <TableHead>{es.users.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((user) => (
                  <TableRow key={user.email} className="cursor-pointer" onClick={() => setDetailEmail(user.email)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
                        </Avatar>
                        {user.name ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.jobRole ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {roleChipIcon(user.role)}
                        {es.roles[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userStatusVariant(user)}>
                        {userStatusIcon(user)}
                        {statusLabel(user)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={() => users.reload()} />

      <UserDetailDialog
        email={detailEmail}
        open={Boolean(detailEmail)}
        onClose={() => setDetailEmail(null)}
        onChanged={() => users.reload()}
      />
    </div>
  );
}
