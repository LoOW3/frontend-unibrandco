import { Ban, CircleCheck, Hourglass, Shield, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import type { BadgeProps } from '@/components/ui/badge';
import type { AdminUser, UserRole } from '../../../types/admin-api';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

/** Leading icon for a permission-role badge. */
export function roleChipIcon(role: UserRole): ReactNode {
  return role === 'SUPER_ADMIN' ? <ShieldCheck /> : <Shield />;
}

/** Badge variant for a permission role. */
export function roleBadgeVariant(role: UserRole): BadgeVariant {
  return role === 'SUPER_ADMIN' ? 'default' : 'secondary';
}

/** Leading icon for a user status badge. */
export function userStatusIcon(user: AdminUser): ReactNode {
  if (!user.enabled) {
    return <Ban />;
  }
  return user.status === 'FORCE_CHANGE_PASSWORD' ? <Hourglass /> : <CircleCheck />;
}

/** Badge variant for a user status. */
export function userStatusVariant(user: AdminUser): BadgeVariant {
  if (!user.enabled) {
    return 'muted';
  }
  return user.status === 'FORCE_CHANGE_PASSWORD' ? 'warning' : 'success';
}
