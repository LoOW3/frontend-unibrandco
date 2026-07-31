import { LogOut, Menu as MenuIcon, Moon, Sun, User, Users } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { CorajeButton } from '@/components/coraje-anchor';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/use-auth';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { useTheme } from '@/features/theme/use-theme';
import { cn } from '@/lib/cn';
import { es } from '@/i18n/es';
import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_PROFILE_PATH,
  ADMIN_USERS_PATH,
  adminNavItems,
} from './admin-nav-items';

export function AdminLayout() {
  const { signOut, email } = useAuth();
  const { user } = useCurrentUser();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const label = user?.name ?? user?.email ?? email ?? '';

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const avatar = (
    <Avatar className="size-8">{user?.avatarUrl ? <AvatarImage src={user.avatarUrl} /> : null}</Avatar>
  );

  const themeItem = (
    <DropdownMenuItem onSelect={toggleTheme}>
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
      {resolvedTheme === 'dark' ? es.nav.lightMode : es.nav.darkMode}
    </DropdownMenuItem>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={es.nav.openMenu}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetTitle>{es.nav.openMenu}</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center px-4">
                  <img src="/assets/unibrandco-logo-black.webp" alt="Unibrandco" className="h-8 w-auto dark:hidden" />
                  <img src="/assets/unibrandco-logo.webp" alt="Unibrandco" className="hidden h-8 w-auto dark:block" />
                </div>
                <Separator />
                <nav className="flex flex-col gap-1 p-2">
                  {adminNavItems.map(({ label: navLabel, to, icon: Icon }) => (
                    <SheetClose asChild key={to}>
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                            isActive
                              ? 'bg-accent font-medium text-accent-foreground'
                              : 'text-foreground hover:bg-accent',
                          )
                        }
                      >
                        <Icon className="size-4" />
                        {navLabel}
                      </NavLink>
                    </SheetClose>
                  ))}
                </nav>
                <Separator />
                <nav className="flex flex-col gap-1 p-2">
                  <SheetClose asChild>
                    <NavLink
                      to={ADMIN_PROFILE_PATH}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <User className="size-4" /> {es.nav.profile}
                    </NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink
                      to={ADMIN_USERS_PATH}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Users className="size-4" /> {es.nav.users}
                    </NavLink>
                  </SheetClose>
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                  >
                    <LogOut className="size-4" /> {es.nav.logout}
                  </button>
                </nav>
                <div className="mt-auto flex justify-end p-3">
                  <CorajeButton className="w-10" side="top" />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <NavLink to={ADMIN_DASHBOARD_PATH} className="flex flex-1 items-center">
            <img src="/assets/unibrandco-logo-black.webp" alt="Unibrandco" className="h-9 w-auto dark:hidden md:h-10" />
            <img src="/assets/unibrandco-logo.webp" alt="Unibrandco" className="hidden h-9 w-auto dark:block md:h-10" />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {adminNavItems.map(({ label: navLabel, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors',
                    isActive
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {navLabel}
              </NavLink>
            ))}

            <Separator orientation="vertical" className="mx-1 h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-1.5">
                  {avatar}
                  <span className="max-w-[12rem] truncate">{label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themeItem}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate(ADMIN_PROFILE_PATH)}>
                  <User /> {es.nav.profile}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate(ADMIN_USERS_PATH)}>
                  <Users /> {es.nav.users}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut /> {es.nav.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={es.nav.openUserMenu} className="rounded-full">
                  {avatar}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themeItem}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
