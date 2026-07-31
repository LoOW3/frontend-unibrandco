import { Eye, EyeOff } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from './use-auth';
import { es } from '../../i18n/es';

function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return es.auth.signInFailed;
  }
  const { name, message } = error;
  if (name.includes('NotAuthorizedException') || message.includes('NotAuthorizedException')) {
    return es.auth.invalidCredentials;
  }
  if (name.includes('UserNotFoundException') || message.includes('UserNotFoundException')) {
    return es.auth.userNotFound;
  }
  return message || es.auth.signInFailed;
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          aria-label={visible ? es.auth.hidePassword : es.auth.showPassword}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { isAuthenticated, isLoading, signIn, completeNewPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ??
    new URLSearchParams(location.search).get('redirect') ??
    '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { requiresNewPassword } = await signIn(email.trim(), password);
      if (requiresNewPassword) {
        setNeedsNewPassword(true);
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getLoginErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(es.auth.passwordsDontMatch);
      return;
    }
    setIsSubmitting(true);
    try {
      await completeNewPassword(newPassword);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getLoginErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <img
            src="/assets/unibrandco-logo-black.webp"
            alt="Unibrandco"
            className="mx-auto mb-4 block h-12 w-auto dark:hidden"
          />
          <img
            src="/assets/unibrandco-logo.webp"
            alt="Unibrandco"
            className="mx-auto mb-4 hidden h-12 w-auto dark:block"
          />
          <h1 className="text-center text-xl font-semibold">
            {needsNewPassword ? es.auth.newPasswordTitle : es.auth.title}
          </h1>
          <p className="mb-6 mt-1 text-center text-sm text-muted-foreground">
            {needsNewPassword ? es.auth.newPasswordSubtitle : es.auth.subtitle}
          </p>

          {needsNewPassword ? (
            <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
              <PasswordField
                id="new-password"
                label={es.auth.newPassword}
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
              />
              <PasswordField
                id="confirm-password"
                label={es.auth.confirmPassword}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
              {error ? <Alert variant="destructive">{error}</Alert> : null}
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="text-current" /> : null}
                {isSubmitting ? es.auth.settingPassword : es.auth.setPassword}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">{es.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <PasswordField
                id="password"
                label={es.auth.password}
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />
              {error ? <Alert variant="destructive">{error}</Alert> : null}
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="text-current" /> : null}
                {isSubmitting ? es.auth.signingIn : es.auth.signIn}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
