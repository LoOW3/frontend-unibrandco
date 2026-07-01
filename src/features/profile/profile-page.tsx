import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

import { es } from '../../i18n/es';
import { updateMe, uploadAvatar } from '../../lib/admin-api-client';
import { useAuthenticatedFetch } from '../admin/hooks/use-authenticated-fetch';
import { useCurrentUser } from '../auth/use-current-user';
import { roleChipIcon } from '../admin/components/chip-visuals';

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
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : es.profile.saveFailed,
      });
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
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : es.profile.avatarFailed,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 560 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        {es.profile.title}
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 72, height: 72 }} />
            <Button
              variant="outlined"
              startIcon={
                isUploading ? <CircularProgress size={16} /> : <PhotoCameraOutlinedIcon />
              }
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
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
          </Box>

          {feedback ? <Alert severity={feedback.type}>{feedback.text}</Alert> : null}

          <TextField
            label={es.profile.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label={es.profile.jobRole}
            value={jobRole}
            onChange={(event) => setJobRole(event.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label={es.profile.email}
            value={user.email}
            size="small"
            fullWidth
            disabled
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {es.profile.permissionRole}:
            </Typography>
            <Chip
              size="small"
              color={user.role === 'SUPER_ADMIN' ? 'secondary' : 'default'}
              icon={roleChipIcon(user.role)}
              label={es.roles[user.role]}
            />
          </Box>

          <Box>
            <Button
              variant="contained"
              onClick={() => void handleSave()}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {isSaving ? es.profile.saving : es.profile.save}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
