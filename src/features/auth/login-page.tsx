import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import VisibilityIconOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIconOutlined from '@mui/icons-material/VisibilityOffOutlined';
import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from './use-auth';
import { es } from '../../i18n/es';

function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return es.auth.signInFailed;
  }

  const errorName = error.name;
  const errorMessage = error.message;

  if (errorName.includes('NotAuthorizedException') || errorMessage.includes('NotAuthorizedException')) {
    return es.auth.invalidCredentials;
  }

  if (errorName.includes('UserNotFoundException') || errorMessage.includes('UserNotFoundException')) {
    return es.auth.userNotFound;
  }

  return errorMessage || es.auth.signInFailed;
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        px: 2,
      }}
    >
      <Paper elevation={2} sx={{ p: { xs: 2.5, sm: 4 }, width: '100%', maxWidth: 420 }}>
        <Box
          component="img"
          src="/assets/unibrandco-logo-black.webp"
          alt="Unibrandco"
          sx={{
            display: 'block',
            height: 48,
            width: 'auto',
            mx: 'auto',
            mb: 2,
          }}
        />
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          {needsNewPassword ? es.auth.newPasswordTitle : es.auth.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {needsNewPassword ? es.auth.newPasswordSubtitle : es.auth.subtitle}
        </Typography>

        {needsNewPassword ? (
          <Box
            component="form"
            onSubmit={handleSetPassword}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label={es.auth.newPassword}
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={isPasswordVisible ? es.auth.hidePassword : es.auth.showPassword}
                        edge="end"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {isPasswordVisible ? <VisibilityOffIconOutlined /> : <VisibilityIconOutlined />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label={es.auth.confirmPassword}
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? es.auth.settingPassword : es.auth.setPassword}
            </Button>
          </Box>
        ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label={es.auth.email}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />
          <TextField
            label={es.auth.password}
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={isPasswordVisible ? es.auth.hidePassword : es.auth.showPassword}
                      edge="end"
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      {isPasswordVisible ? <VisibilityOffIconOutlined /> : <VisibilityIconOutlined />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} loading={isSubmitting}>
            {isSubmitting ? es.auth.signingIn : es.auth.signIn}
          </Button>
        </Box>
        )}
      </Paper>
    </Box>
  );
}
