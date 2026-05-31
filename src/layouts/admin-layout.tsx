import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/use-auth';
import { CorajeButton } from '../components/coraje-anchor';
import { useIsMobile } from '../hooks/use-is-mobile';
import { es } from '../i18n/es';
import { ADMIN_DASHBOARD_PATH, adminNavItems } from './admin-nav-items';

export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const closeDrawer = (): void => {
    setIsDrawerOpen(false);
  };

  const handleDrawerNav = (): void => {
    closeDrawer();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label={es.nav.openMenu}
              edge="start"
              onClick={() => setIsDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <Box
            component={NavLink}
            to={ADMIN_DASHBOARD_PATH}
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/assets/unibrandco-logo.webp"
              alt="Unibrandco"
              sx={{
                height: { xs: 36, sm: 44, md: 50 },
                width: 'auto',
                display: 'block',
              }}
            />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {adminNavItems.map(({ label, to, icon: Icon }) => (
              <Button
                key={to}
                component={NavLink}
                to={to}
                color="inherit"
                startIcon={<Icon />}
                sx={{
                  opacity: location.pathname === to ? 1 : 0.75,
                  fontWeight: location.pathname === to ? 600 : 400,
                }}
              >
                {label}
              </Button>
            ))}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={() => void handleSignOut()}>
              {es.nav.logout}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isMobile && isDrawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: { display: 'flex', flexDirection: 'column' },
          },
        }}
      >
        <Box
          sx={{
            width: 260,
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          role="presentation"
        >
          <Box
            component={NavLink}
            to={ADMIN_DASHBOARD_PATH}
            onClick={handleDrawerNav}
            sx={{
              display: 'flex',
              justifyContent: 'start',
              alignItems: 'center',
              px: 2,
              py: 1.5,
              textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src="/assets/unibrandco-logo-black.webp"
              alt="Unibrandco"
              sx={{ height: 44, width: 'auto', display: 'block' }}
            />
          </Box>
          <Divider />
          <List>
            {adminNavItems.map(({ label, to, icon: Icon }) => (
              <ListItemButton
                key={to}
                component={NavLink}
                to={to}
                selected={location.pathname === to}
                onClick={handleDrawerNav}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={() => void handleSignOut()}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={es.nav.logout} />
            </ListItemButton>
          </List>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
            <CorajeButton sx={{ width: 40 }} />
          </Box>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
