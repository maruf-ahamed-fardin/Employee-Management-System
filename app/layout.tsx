import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ConfirmHost } from '@/components/ui/confirm';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#080c17' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    template: '%s · SeloraX EMS',
    default: 'SeloraX EMS — Employee Management System',
  },
  description:
    'Enterprise Employee Management System: Staff Directory, Attendance, Leave, Payroll, Documents & Digital Cards',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
      { url: '/icons/icon-192.png', sizes: '192x192' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'SeloraX EMS — Enterprise Employee Management System',
    description: 'Workforce, Attendance, Leave, Payroll & Smart Cards',
    images: [{ url: '/images/logo.png', width: 1200, height: 313, alt: 'SeloraX EMS' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-[#f97316]/20 selection:text-[#ea580c] dark:selection:bg-[#fb923c]/30 dark:selection:text-[#fb923c]`}
      >
        {children}
        <ConfirmHost />
        <Toaster
          position="top-right"
          gap={10}
          toastOptions={{
            classNames: {
              toast:
                'rounded-2xl! border! border-border! bg-popover/95! text-popover-foreground! shadow-[var(--shadow-card)]! backdrop-blur-xl! px-4! py-3.5! gap-3!',
              title: 'text-sm! font-semibold! text-foreground!',
              description: 'text-xs! text-muted-foreground!',
              icon: 'flex! size-8! m-0! shrink-0 items-center! justify-center! rounded-full! [&>svg]:size-4!',
              success: '[&_[data-icon]]:bg-emerald-500/15 [&_[data-icon]]:text-emerald-500',
              error: '[&_[data-icon]]:bg-destructive/15 [&_[data-icon]]:text-destructive',
              warning: '[&_[data-icon]]:bg-amber-500/15 [&_[data-icon]]:text-amber-500',
              info: '[&_[data-icon]]:bg-primary/15 [&_[data-icon]]:text-brand-blue',
              closeButton: 'bg-popover! border-border! text-muted-foreground!',
            },
          }}
        />
      </body>
    </html>
  );
}
