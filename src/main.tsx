import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './config/amplify';
import { CorajeAnchor } from './components/coraje-anchor';
import { TooltipProvider } from './components/ui/tooltip';
import { AuthProvider } from './features/auth/auth-provider';
import { ThemeProvider } from './features/theme/theme-provider';
import { AppRouter } from './routes/app-router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>
          <BrowserRouter>
            <AppRouter />
            <CorajeAnchor />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
