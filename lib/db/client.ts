import { PrismaClient } from '@prisma/client';

import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim();

  // On Vercel serverless, root filesystem is read-only, but /tmp is writable.
  // Copy seed dev.db to /tmp/dev.db if using local SQLite so writes work.
  if (process.env.VERCEL && (!envUrl || envUrl.startsWith('file:'))) {
    try {
      const tmpDb = '/tmp/dev.db';
      const rootDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (!fs.existsSync(tmpDb) && fs.existsSync(rootDb)) {
        fs.copyFileSync(rootDb, tmpDb);
      }
      return `file:${tmpDb}`;
    } catch {
      return 'file:./dev.db';
    }
  }

  if (envUrl && envUrl !== '') {
    return envUrl;
  }

  return 'file:./dev.db';
}

const resolvedDbUrl = getDatabaseUrl();
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = resolvedDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedDbUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
