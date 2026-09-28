'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { SeloraLogo } from '@/components/brand/SeloraLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Reset link dispatched to your work email');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center pb-2">
          <Link href="/login">
            <SeloraLogo size="md" subtitle="EMS Enterprise" />
          </Link>
        </div>

        <Card className="border-border shadow-xl bg-card">
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              We’ll send password recovery instructions to your registered email
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900 dark:text-white">Check your inbox</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  If an account matches {email}, you will receive a link to choose a new password.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" size="sm">Back to Login</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registered Email
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

                <Button type="submit" className="w-full h-10 font-bold">
                  Send reset instructions
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
