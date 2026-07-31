import { Bot } from 'lucide-react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { es } from '../../../i18n/es';
import { useUsersDirectory } from '../hooks/use-users-directory';

interface ActorBadgeProps {
  /** Actor email, or null for an automatic/scheduled run. */
  email: string | null | undefined;
}

/**
 * Renders who ran an action: avatar + name resolved from the users directory,
 * or a robot icon + "Automático" when there is no actor.
 */
export function ActorBadge({ email }: ActorBadgeProps) {
  const directory = useUsersDirectory();

  if (!email) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <Bot className="size-4" />
        {es.actor.automatic}
      </span>
    );
  }

  const user = directory.get(email.toLowerCase());
  const label = user?.name ?? email;

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Avatar className="size-6">{user?.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}</Avatar>
      {label}
    </span>
  );
}
