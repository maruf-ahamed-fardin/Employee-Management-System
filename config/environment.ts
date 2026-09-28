export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'SeloraX EMS',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  authSecret: process.env.AUTH_SECRET || 'selorax-super-secret-key-32-chars-long!',
  isProduction: process.env.NODE_ENV === 'production',
};
