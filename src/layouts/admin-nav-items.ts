import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

import { es } from '../i18n/es';

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const ADMIN_STOCK_FILES_PATH = '/admin/stock-files';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: SvgIconComponent;
}

export const adminNavItems: AdminNavItem[] = [
  { label: es.nav.dashboard, to: ADMIN_DASHBOARD_PATH, icon: DashboardOutlinedIcon },
  { label: es.nav.stockFiles, to: ADMIN_STOCK_FILES_PATH, icon: FolderOutlinedIcon },
];
