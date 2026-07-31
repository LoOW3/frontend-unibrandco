import { LogOut, Menu as MenuIcon, Moon, Sun, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/use-auth';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { useTheme } from '@/features/theme/use-theme';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import { ADMIN_DASHBOARD_PATH, ADMIN_PROFILE_PATH, ADMIN_USERS_PATH, adminNavItems } from './admin-nav-items';

const ITEM_BASE = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors';
const ITEM_INACTIVE = 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';
const ITEM_ACTIVE = 'bg-accent font-medium text-accent-foreground';

function Logo() {
  return (
    <>
      <img src="/assets/unibrandco-logo-black.webp" alt="Unibrandco" className="h-8 w-auto dark:hidden" />
      <img src="/assets/unibrandco-logo.webp" alt="Unibrandco" className="hidden h-8 w-auto dark:block" />
    </>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
      {adminNavItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_INACTIVE)}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { signOut, email } = useAuth();
  const { user } = useCurrentUser();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const label = user?.name ?? user?.email ?? email ?? '';
  const roleLabel = user ? es.roles[user.role] : '';
  const themeLabel = resolvedTheme === 'dark' ? es.nav.lightMode : es.nav.darkMode;

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const avatar = (
    <span className="block size-8 shrink-0 overflow-hidden rounded-full bg-muted">
      {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : null}
    </span>
  );

  // Footer, always visible. Order top → bottom:
  // Users · theme toggle · divider · user (→ profile) · logout.
  const renderFooter = (onNavigate?: () => void): ReactNode => {
    const goProfile = (): void => {
      onNavigate?.();
      navigate(ADMIN_PROFILE_PATH);
    };

    return (
      <div className="flex flex-col gap-1 p-2">
        <NavLink
          to={ADMIN_USERS_PATH}
          onClick={onNavigate}
          className={({ isActive }) => cn(ITEM_BASE, isActive ? ITEM_ACTIVE : ITEM_INACTIVE)}
        >
          <Users className="size-4 shrink-0" />
          <span className="truncate">{es.nav.users}</span>
        </NavLink>

        <button type="button" onClick={toggleTheme} className={cn(ITEM_BASE, ITEM_INACTIVE)}>
          {resolvedTheme === 'dark' ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />}
          <span className="truncate">{themeLabel}</span>
        </button>

        <Separator className="my-1" />

        <button
          type="button"
          onClick={goProfile}
          aria-label={es.nav.profile}
          className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
        >
          {avatar}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{label}</span>
            <span className="block truncate text-xs text-muted-foreground">{roleLabel}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          className={cn(ITEM_BASE, ITEM_INACTIVE)}
        >
          <LogOut className="size-4 shrink-0" />
          <span className="truncate">{es.nav.logout}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center px-4">
          <NavLink to={ADMIN_DASHBOARD_PATH} className="flex items-center overflow-hidden">
            <Logo />
          </NavLink>
        </div>
        <Separator />

        <NavLinks />

        <Separator />
        {renderFooter()}
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur md:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={es.nav.openMenu}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">{es.nav.openMenu}</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center px-4">
                  <Logo />
                </div>
                <Separator />
                <NavLinks onNavigate={() => setDrawerOpen(false)} />
                <Separator />
                {renderFooter(() => setDrawerOpen(false))}
              </div>
            </SheetContent>
          </Sheet>

          <NavLink to={ADMIN_DASHBOARD_PATH} className="flex flex-1 items-center">
            <Logo />
          </NavLink>

          <button
            type="button"
            onClick={() => navigate(ADMIN_PROFILE_PATH)}
            aria-label={es.nav.profile}
            className="rounded-full"
          >
            {avatar}
          </button>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
