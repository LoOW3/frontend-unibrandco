import { useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '../../../hooks/use-is-mobile';
import { es } from '../../../i18n/es';
import { deleteUser, getUser, setUserEnabled, updateUser } from '../../../lib/admin-api-client';
import type { AdminUser, UserRole } from '../../../types/admin-api';
import { useAuth } from '../../auth/use-auth';
import { useAuthenticatedFetch } from '../hooks/use-authenticated-fetch';
import { roleBadgeVariant, roleChipIcon, userStatusIcon, userStatusVariant } from './chip-visuals';

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
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent fullScreen={isMobile} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{es.users.detailTitle}</DialogTitle>
          </DialogHeader>

          {error ? <Alert variant="destructive">{error}</Alert> : null}
          {!user ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-7" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold">{user.name ?? '—'}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={userStatusVariant(user)} className="ml-auto">
                  {userStatusIcon(user)}
                  {statusLabel}
                </Badge>
              </div>

              {isSuperAdmin ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="user-name">{es.users.name}</Label>
                    <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="user-jobrole">{es.users.jobRole}</Label>
                    <Input id="user-jobrole" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>{es.users.role}</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">{es.roles.ADMIN}</SelectItem>
                        <SelectItem value="SUPER_ADMIN">{es.roles.SUPER_ADMIN}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    {es.users.jobRole}: {user.jobRole ?? '—'}
                  </p>
                  <Badge variant={roleBadgeVariant(user.role)} className="w-fit">
                    {roleChipIcon(user.role)}
                    {es.roles[user.role]}
                  </Badge>
                </>
              )}
            </div>
          )}

          {isSuperAdmin && user ? (
            <DialogFooter className="sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={user.enabled ? 'text-warning' : 'text-success'}
                  disabled={busy}
                  onClick={() => void run((idToken) => setUserEnabled(idToken, user.email, !user.enabled))}
                >
                  {user.enabled ? es.users.disable : es.users.enable}
                </Button>
                <Button variant="outline" className="text-destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>
                  {es.users.delete}
                </Button>
              </div>
              <Button
                disabled={busy}
                onClick={() =>
                  void run((idToken) =>
                    updateUser(idToken, user.email, { name: name.trim(), jobRole: jobRole.trim(), role }),
                  )
                }
              >
                {busy ? <Spinner className="text-current" /> : null}
                {busy ? es.users.saving : es.users.save}
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={(next) => !next && setConfirmDelete(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{es.users.deleteConfirmTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{user ? es.users.deleteConfirmBody(user.email) : ''}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>
              {es.users.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => {
                if (user) {
                  void run((idToken) => deleteUser(idToken, user.email), true);
                }
              }}
            >
              {busy ? <Spinner className="text-current" /> : null}
              {es.users.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
