import { Camera } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { es } from '../../i18n/es';
import { updateMe, uploadAvatar } from '../../lib/admin-api-client';
import { useAuthenticatedFetch } from '../admin/hooks/use-authenticated-fetch';
import { useCurrentUser } from '../auth/use-current-user';
import { roleBadgeVariant, roleChipIcon } from '../admin/components/chip-visuals';

export function ProfilePage() {
  const { withAuth } = useAuthenticatedFetch();
  const { user, setUser, error: loadError } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setJobRole(user.jobRole ?? '');
    }
  }, [user]);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await withAuth((idToken) =>
        updateMe(idToken, { name: name.trim(), jobRole: jobRole.trim() }),
      );
      setUser(updated);
      setFeedback({ type: 'success', text: es.profile.saved });
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : es.profile.saveFailed });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (file: File): Promise<void> => {
    setIsUploading(true);
    setFeedback(null);
    try {
      const key = await withAuth((idToken) => uploadAvatar(idToken, file));
      const updated = await withAuth((idToken) => updateMe(idToken, { avatarKey: key }));
      setUser(updated);
      setFeedback({ type: 'success', text: es.profile.saved });
    } catch (error) {
      setFeedback({ type: 'error', text: error instanceof Error ? error.message : es.profile.avatarFailed });
    } finally {
      setIsUploading(false);
    }
  };

  if (loadError) {
    return <Alert variant="destructive">{loadError}</Alert>;
  }

  if (!user) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">{es.profile.title}</h1>

      <Card>
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-[72px]">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}
            </Avatar>
            <Button variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? <Spinner /> : <Camera />}
              {es.profile.changeAvatar}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleAvatarChange(file);
                }
                event.target.value = '';
              }}
            />
          </div>

          {feedback ? (
            <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'}>{feedback.text}</Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{es.profile.name}</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobRole">{es.profile.jobRole}</Label>
            <Input id="jobRole" value={jobRole} onChange={(event) => setJobRole(event.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{es.profile.email}</Label>
            <Input id="email" value={user.email} disabled />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{es.profile.permissionRole}:</span>
            <Badge variant={roleBadgeVariant(user.role)}>
              {roleChipIcon(user.role)}
              {es.roles[user.role]}
            </Badge>
          </div>

          <div>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? <Spinner className="text-current" /> : null}
              {isSaving ? es.profile.saving : es.profile.save}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
