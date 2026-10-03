'use client';

import { useUIStore } from '@/stores/ui.store';
import { useAuth } from '@/hooks/useAuth';
import { Breadcrumb } from './Breadcrumb';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@/components/ui/dropdown';
import { Menu, Moon, Sun, Bell, LogOut, UserCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { CommandSearch } from './CommandSearch';
import { HeaderPunchWidget } from '@/components/attendance/HeaderPunchWidget';

export function Header() {
  const { setMobileMenuOpen, theme, toggleTheme } = useUIStore();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#090d16]/80">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle navigation</span>
        </button>
        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex items-center gap-2">
        <CommandSearch />
      </div>

      {/* Right Action Icons & User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Quick Punch Terminal Widget */}
        <HeaderPunchWidget />
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle Theme"
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span className="sr-only">Toggle theme</span>
        </button>

        {/* Live Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Profile Menu */}
        <Dropdown>
          <DropdownTrigger>
            <div className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <Avatar
                initials={user?.employeeName ? user.employeeName.slice(0, 2).toUpperCase() : 'AD'}
                size="sm"
                src={user?.photoUrl}
              />
              <div className="hidden text-left lg:block">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.employeeName || user?.email || 'Super Admin'}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 capitalize">
                  {user?.role || 'admin'}
                </p>
              </div>
            </div>
          </DropdownTrigger>
          <DropdownMenu align="right" className="w-56">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {user?.employeeName || 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@selorax.test'}</p>
            </div>
            <DropdownItem>
              <Link href="/profile" className="flex items-center gap-2 size-full">
                <UserCircle className="size-4" />
                <span>My Profile</span>
              </Link>
            </DropdownItem>
            <DropdownItem>
              <Link href="/profile/security" className="flex items-center gap-2 size-full">
                <Shield className="size-4" />
                <span>Password & Sign-in</span>
              </Link>
            </DropdownItem>
            <DropdownItem onClick={signOut} destructive>
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}
