import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '../features/auth/protected-route';
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_MANUAL_SYNC_PATH,
  ADMIN_PEDIDOS_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_STOCK_FILES_PATH,
  ADMIN_USERS_PATH,
} from '../layouts/admin-nav-items';

const LoginPage = lazy(() =>
  import('../features/auth/login-page').then((module) => ({ default: module.LoginPage })),
);
const AdminLayout = lazy(() =>
  import('../layouts/admin-layout').then((module) => ({ default: module.AdminLayout })),
);
const AdminDashboardPage = lazy(() =>
  import('../features/admin/admin-dashboard-page').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const StockFilesPage = lazy(() =>
  import('../features/admin/stock-files-page').then((module) => ({ default: module.StockFilesPage })),
);
const PatagoniaPedidosPage = lazy(() =>
  import('../features/admin/patagonia-pedidos-page').then((module) => ({
    default: module.PatagoniaPedidosPage,
  })),
);
const ManualSyncPage = lazy(() =>
  import('../features/admin/manual-sync-page').then((module) => ({
    default: module.ManualSyncPage,
  })),
);
const ProfilePage = lazy(() =>
  import('../features/profile/profile-page').then((module) => ({
    default: module.ProfilePage,
  })),
);
const UsersPage = lazy(() =>
  import('../features/admin/users-page').then((module) => ({ default: module.UsersPage })),
);

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboardPage />} />
            <Route path={ADMIN_PEDIDOS_PATH} element={<PatagoniaPedidosPage />} />
            <Route path={ADMIN_STOCK_FILES_PATH} element={<StockFilesPage />} />
            <Route path={ADMIN_MANUAL_SYNC_PATH} element={<ManualSyncPage />} />
            <Route path={ADMIN_PROFILE_PATH} element={<ProfilePage />} />
            <Route path={ADMIN_USERS_PATH} element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="/admins" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route
          path="/admins/stock-files"
          element={<Navigate to={ADMIN_STOCK_FILES_PATH} replace />}
        />
        <Route path="/" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route path="*" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
      </Routes>
    </Suspense>
  );
}
