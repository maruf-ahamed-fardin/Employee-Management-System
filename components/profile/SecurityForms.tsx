'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Laptop,
  Smartphone,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SecurityForms() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [signingOutOthers, setSigningOutOthers] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to change password');

      toast.success('Your password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Error changing password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleSignOutOthers = async () => {
    setSigningOutOthers(true);
    try {
      const res = await fetch('/api/auth/logout-others', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to revoke other sessions');
      toast.success('Signed out from all other devices successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error signing out from other devices');
    } finally {
      setSigningOutOthers(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Choose a strong, unique password to safeguard your account.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="h-10 text-xs pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">New Password</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-10 text-xs pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="h-10 text-xs"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={changingPass || !newPassword || !currentPassword}
              className="font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {changingPass ? (
                <Loader2 className="size-4 animate-spin mr-1.5" />
              ) : (
                <KeyRound className="size-4 mr-1.5" />
              )}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </section>

      {/* Active Sessions & Remote Revocation Card */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Device & Sign-in Sessions</h2>
            <p className="text-xs text-muted-foreground">
              Devices and browsers where your account is currently signed in.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Current Session */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-accent/40">
            <div className="flex items-center gap-3.5">
              <span className="size-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary">
                <Laptop className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-foreground">Current Active Session</p>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    This Device
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Web Browser · Windows 11 · Active now
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Sign out of other devices</p>
            <p className="text-[11px] text-muted-foreground">
              Revoke active logins on all other computers, tablets, or phones immediately.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleSignOutOthers}
            disabled={signingOutOthers}
            className="text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
          >
            {signingOutOthers ? (
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
            ) : (
              <LogOut className="size-3.5 mr-1.5" />
            )}
            <span>Sign out all others</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
