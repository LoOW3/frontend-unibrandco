import {
  Activity,
  Folder,
  LayoutDashboard,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import { es } from '../i18n/es';

export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const ADMIN_VENTAS_PATH = '/admin/ventas';
export const ADMIN_STOCK_SYNC_PATH = '/admin/stock-sync';
export const ADMIN_STOCK_FILES_PATH = '/admin/stock-files';
export const ADMIN_PEDIDOS_PATH = '/admin/pedidos';
export const ADMIN_MANUAL_SYNC_PATH = '/admin/manual-sync';
export const ADMIN_PROFILE_PATH = '/admin/profile';
export const ADMIN_USERS_PATH = '/admin/users';

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { label: es.nav.dashboard, to: ADMIN_DASHBOARD_PATH, icon: LayoutDashboard },
  { label: es.nav.ventas, to: ADMIN_VENTAS_PATH, icon: TrendingUp },
  { label: es.nav.stockSync, to: ADMIN_STOCK_SYNC_PATH, icon: Activity },
  { label: es.nav.pedidos, to: ADMIN_PEDIDOS_PATH, icon: ShoppingCart },
  { label: es.nav.stockFiles, to: ADMIN_STOCK_FILES_PATH, icon: Folder },
  { label: es.nav.manualSync, to: ADMIN_MANUAL_SYNC_PATH, icon: RefreshCw },
];
