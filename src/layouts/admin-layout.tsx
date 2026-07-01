import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/use-auth';
import { useCurrentUser } from '../features/auth/use-current-user';
import { CorajeButton } from '../components/coraje-anchor';
import { useIsMobile } from '../hooks/use-is-mobile';
import { es } from '../i18n/es';
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_USERS_PATH,
  adminNavItems,
} from './admin-nav-items';

export function AdminLayout() {
  const { signOut, name, email } = useAuth();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const avatarUrl = user?.avatarUrl ?? null;

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const closeDrawer = (): void => setIsDrawerOpen(false);
  const closeMenu = (): void => setMenuAnchor(null);

  const goTo = (path: string): void => {
    closeMenu();
    closeDrawer();
    navigate(path);
  };

  const label = user?.name ?? user?.email ?? name ?? email ?? '';
  const avatar = <Avatar src={avatarUrl ?? undefined} sx={{ width: 32, height: 32 }} />;

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
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src="/assets/unibrandco-logo.webp"
              alt="Unibrandco"
              sx={{ height: { xs: 36, sm: 44, md: 50 }, width: 'auto', display: 'block' }}
            />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {adminNavItems.map(({ label: navLabel, to, icon: Icon }) => (
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
                {navLabel}
              </Button>
            ))}
            <Divider
              orientation="vertical"
              flexItem
              sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <Button
              color="inherit"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              startIcon={avatar}
              aria-label={es.nav.openUserMenu}
              sx={{ textTransform: 'none' }}
            >
              {label}
            </Button>
          </Box>

          {isMobile ? (
            <IconButton
              color="inherit"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label={es.nav.openUserMenu}
              edge="end"
            >
              {avatar}
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} disableScrollLock>
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => goTo(ADMIN_PROFILE_PATH)}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          {es.nav.profile}
        </MenuItem>
        <MenuItem onClick={() => goTo(ADMIN_USERS_PATH)}>
          <ListItemIcon>
            <GroupOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {es.nav.users}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => void handleSignOut()}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {es.nav.logout}
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={isMobile && isDrawerOpen}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { display: 'flex', flexDirection: 'column' } } }}
      >
        <Box
          sx={{ width: 260, minHeight: '100%', display: 'flex', flexDirection: 'column' }}
          role="presentation"
        >
          <Box
            component={NavLink}
            to={ADMIN_DASHBOARD_PATH}
            onClick={closeDrawer}
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
            {adminNavItems.map(({ label: navLabel, to, icon: Icon }) => (
              <ListItemButton
                key={to}
                component={NavLink}
                to={to}
                selected={location.pathname === to}
                onClick={closeDrawer}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={navLabel} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={() => goTo(ADMIN_PROFILE_PATH)}>
              <ListItemIcon>
                <PersonOutlineIcon />
              </ListItemIcon>
              <ListItemText primary={es.nav.profile} />
            </ListItemButton>
            <ListItemButton onClick={() => goTo(ADMIN_USERS_PATH)}>
              <ListItemIcon>
                <GroupOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={es.nav.users} />
            </ListItemButton>
            <ListItemButton onClick={() => void handleSignOut()}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary={es.nav.logout} />
            </ListItemButton>
          </List>
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
            <CorajeButton sx={{ width: 40 }} tooltipPlacement="top" />
          </Box>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
