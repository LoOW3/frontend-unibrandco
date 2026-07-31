import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from './use-auth';
import { es } from '../../i18n/es';

export function ProtectedRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto mt-8 max-w-2xl px-4">
        <Alert variant="destructive">{es.auth.notAdmin}</Alert>
      </div>
    );
  }

  return <Outlet />;
}
