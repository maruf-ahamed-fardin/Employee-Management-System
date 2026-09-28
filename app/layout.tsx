import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#252175' },
    { media: '(prefers-color-scheme: dark)', color: '#080c16' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-[#f37021]/20 selection:text-[#ea580c] dark:selection:bg-[#f37021]/30 dark:selection:text-[#fb923c]">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
