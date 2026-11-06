'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lock, Mail, Sparkles, UserPlus, LogIn, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { SeloraLogo } from '@/components/brand/SeloraLogo';
import {
  isFirebaseConfigured,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resendVerificationEmail,
} from '@/lib/firebase/client';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState(true);

  useEffect(() => {
    setHasFirebaseConfig(isFirebaseConfigured());
  }, []);

  const authenticateWithBackend = async (idToken: string) => {
    const res = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    let data: any = {};
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, error: res.statusText || 'Server error verifying authentication' };
    }
    return { ok: res.ok, status: res.status, data };
  };

  const handleGoogleSignIn = async () => {
    if (!hasFirebaseConfig) {
      toast.error('Firebase configuration is missing in .env');
      return;
    }

    setGoogleLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      const result = await authenticateWithBackend(idToken);

      if (result.ok && result.data.success) {
        toast.success(result.data.message || 'Signed in with Google!');
        window.location.href = '/dashboard';
      } else {
        toast.error(result.data.error || 'Google sign-in verification failed');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        toast.error(err?.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    setVerificationSent(false);

    try {
      if (!hasFirebaseConfig) {
        // Fallback to legacy mock login if Firebase is not yet configured
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Signed in successfully (demo mode)!');
          router.push('/dashboard');
          router.refresh();
        } else {
          toast.error(data.error || 'Invalid credentials');
        }
        return;
      }

      if (mode === 'signup') {
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        // Firebase create account + sends verification email
        await signUpWithEmail(email.trim(), password);
        setNeedsVerification(true);
        setVerificationSent(true);
        toast.success('Account created! A verification link was sent to your email.');
      } else {
        // Sign in mode
        const { user, idToken } = await signInWithEmail(email.trim(), password);

        // Check if user has verified email
        if (!user.emailVerified) {
          setNeedsVerification(true);
          toast.error('Please verify your email address before signing in.');
          return;
        }

        const result = await authenticateWithBackend(idToken);

        if (result.ok && result.data.success) {
          toast.success('Signed in successfully!');
          window.location.href = '/dashboard';
        } else if (result.status === 403 && result.data.emailVerified === false) {
          setNeedsVerification(true);
          toast.error(result.data.error || 'Please verify your email address.');
        } else {
          toast.error(result.data.error || 'Authentication failed');
        }
      }
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (err?.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters');
      } else {
        toast.error(err?.message || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationSent(true);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not resend verification email');
    }
  };

  const fillDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123456');

    // Direct legacy demo login for rapid testing
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'Demo@123456' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Logged in as ${data.data.user.role}`);
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Demo login failed');
      }
    } catch {
      toast.error('Demo login request failed');
    } finally {
      setLoading(false);
    }
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

        {/* Warning if Firebase env is missing */}
        {!hasFirebaseConfig && (
          <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Firebase config missing</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Add your Firebase API keys to <code className="bg-amber-500/20 px-1 py-0.5 rounded">.env</code> to activate Google & Email verification sign-in.
              </p>
            </div>
          </div>
        )}

        <Card className="border-border shadow-xl bg-card">
          <CardHeader className="pb-3">
            {/* Mode Tabs */}
            <div className="flex rounded-xl p-1 bg-muted/60 mb-2 border border-border/50">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setNeedsVerification(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="size-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setNeedsVerification(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="size-3.5" />
                Create Account
              </button>
            </div>

            <CardTitle className="text-xl">
              {mode === 'signin' ? 'Welcome back' : 'Create an employee account'}
            </CardTitle>
            <CardDescription className="text-xs">
              {mode === 'signin'
                ? 'Sign in using your Google account or work email'
                : 'Registration creates a verified Employee account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Verification Notice Banner */}
            {needsVerification && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verify your email address</p>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      We sent a verification link to <span className="font-semibold text-foreground">{email}</span>. Click the link in your email, then return here to sign in.
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={handleResendVerification}
                  >
                    Resend link
                  </Button>
                  {verificationSent && (
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      Link sent!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading || !hasFirebaseConfig}
              className="w-full h-11 text-xs font-semibold border-border hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>
                {googleLoading
                  ? 'Connecting to Google...'
                  : mode === 'signup'
                  ? 'Sign up with Google'
                  : 'Continue with Google'}
              </span>
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <span className="relative bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Or with work email
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
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
                    placeholder="name@company.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-primary hover:text-[#f37021] dark:hover:text-[#fb923c] transition-colors hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
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
                    minLength={6}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="pl-9"
                      minLength={6}
                    />
                  </div>
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-border text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <AlertCircle className="size-3.5 text-[#f37021] shrink-0 mt-0.5" />
                    <span>
                      Self-service registration assigns the standard <strong>Employee</strong> role. Elevated permissions require an administrator.
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-11 text-xs font-bold mt-2"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Create Employee Account'
                  : 'Sign in to EMS'}
              </Button>
            </form>

            {/* Quick Demo Logins for Testing */}
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
