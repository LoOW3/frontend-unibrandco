import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminDashboardPage } from '../features/admin/admin-dashboard-page';
import { StockFilesPage } from '../features/admin/stock-files-page';
import { LoginPage } from '../features/auth/login-page';
import { ProtectedRoute } from '../features/auth/protected-route';
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_STOCK_FILES_PATH,
} from '../layouts/admin-nav-items';
import { AdminLayout } from '../layouts/admin-layout';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ADMIN_DASHBOARD_PATH} element={<AdminDashboardPage />} />
          <Route path={ADMIN_STOCK_FILES_PATH} element={<StockFilesPage />} />
        </Route>
      </Route>
      <Route path="/admins" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
      <Route path="/admins/stock-files" element={<Navigate to={ADMIN_STOCK_FILES_PATH} replace />} />
      <Route path="/" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
      <Route path="*" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
    </Routes>
  );
}
