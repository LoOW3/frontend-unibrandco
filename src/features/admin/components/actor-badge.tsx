import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { es } from '../../../i18n/es';
import { useUsersDirectory } from '../hooks/use-users-directory';

interface ActorBadgeProps {
  /** Actor email, or null for an automatic/scheduled run. */
  email: string | null | undefined;
  size?: number;
}

/**
 * Renders who ran an action: avatar + name resolved from the users directory,
 * or a robot icon + "Automático" when there is no actor.
 */
export function ActorBadge({ email, size = 24 }: ActorBadgeProps) {
  const directory = useUsersDirectory();

  if (!email) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        <SmartToyOutlinedIcon fontSize="small" color="disabled" />
        <Typography variant="body2" color="text.secondary">
          {es.actor.automatic}
        </Typography>
      </Box>
    );
  }

  const user = directory.get(email.toLowerCase());
  const label = user?.name ?? email;

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Avatar
        src={user?.avatarUrl ?? undefined}
        sx={{ width: size, height: size, fontSize: `${size * 0.42}px` }}
      >
        {label.slice(0, 2).toUpperCase()}
      </Avatar>
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
