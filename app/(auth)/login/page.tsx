'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SeloraLogo } from '@/components/brand/SeloraLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Signed in successfully!');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Network error signing in');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123456');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xl shadow-[#252175]/5 dark:shadow-black/40">
            <SeloraLogo size="lg" subtitle="EMS Enterprise" />
          </div>
          <p className="text-xs text-muted-foreground font-medium pt-1">
            Enterprise Workforce & Employee Management
          </p>
        </div>

        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="pb-4">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your work email and password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Work Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@selorax.test"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-semibold text-primary hover:text-[#f37021] dark:hover:text-[#fb923c] transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-bold mt-2">
                {loading ? 'Authenticating...' : 'Sign in'}
              </Button>
            </form>

            {/* Quick Demo Logins */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                <Sparkles className="size-3 text-[#f37021]" />
                <span>Quick Demo Accounts</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillDemo('superadmin@selorax.test')}
                  className="p-2.5 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-800/40 text-left hover:border-[#f37021]/50 dark:hover:border-[#f37021]/50 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-900 dark:text-white">Super Admin</p>
                  <p className="text-[10px] text-muted-foreground">Full system control</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('hr@selorax.test')}
                  className="p-2.5 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-800/40 text-left hover:border-[#f37021]/50 dark:hover:border-[#f37021]/50 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-900 dark:text-white">HR Admin</p>
                  <p className="text-[10px] text-muted-foreground">Staff & payroll</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('manager@selorax.test')}
                  className="p-2.5 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-800/40 text-left hover:border-[#f37021]/50 dark:hover:border-[#f37021]/50 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-900 dark:text-white">Manager</p>
                  <p className="text-[10px] text-muted-foreground">Team approvals</p>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('employee@selorax.test')}
                  className="p-2.5 rounded-xl border border-border bg-slate-50/60 dark:bg-slate-800/40 text-left hover:border-[#f37021]/50 dark:hover:border-[#f37021]/50 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-900 dark:text-white">Employee</p>
                  <p className="text-[10px] text-muted-foreground">Self service & card</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
