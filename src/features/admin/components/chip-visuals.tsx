import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { ReactElement } from 'react';

import type { AdminUser, UserRole } from '../../../types/admin-api';

/** Leading icon for a permission-role chip. */
export function roleChipIcon(role: UserRole): ReactElement {
  return role === 'SUPER_ADMIN' ? <VerifiedUserOutlinedIcon /> : <ShieldOutlinedIcon />;
}

/** Leading icon for a user status chip. */
export function userStatusIcon(user: AdminUser): ReactElement {
  if (!user.enabled) {
    return <BlockIcon />;
  }
  return user.status === 'FORCE_CHANGE_PASSWORD' ? <HourglassEmptyIcon /> : <CheckCircleOutlineIcon />;
}
