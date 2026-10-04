import { randomUUID } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

export interface StorageProvider {
  /** Stores the bytes and returns an opaque key to keep in the database. */
  upload(file: Buffer, extension: string): Promise<string>;
  /** Returns the stored bytes, or null if the key is unknown or the file is gone. */
  read(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
  /** Whether this provider issued the key (legacy rows hold placeholder URLs with no file behind them). */
  owns(key: string): boolean;
}

const LOCAL_PREFIX = 'local:';
// Keys are generated here, never taken from user input, but validate anyway so a bad row can't escape the folder
const LOCAL_KEY = /^local:[0-9a-f-]{36}\.[a-z0-9]{1,5}$/;

/**
 * Keeps files on disk outside `public/`, so they are only reachable through the
 * authenticated download route. Swap for an S3 provider when moving off a single server.
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly dir = process.env.DOCUMENT_STORAGE_DIR || path.join(process.cwd(), 'storage', 'documents');

  private pathFor(key: string) {
    return path.join(this.dir, key.slice(LOCAL_PREFIX.length));
  }

  owns(key: string) {
    return LOCAL_KEY.test(key);
  }

  async upload(file: Buffer, extension: string): Promise<string> {
    await mkdir(this.dir, { recursive: true });
    const key = `${LOCAL_PREFIX}${randomUUID()}.${extension}`;
    await writeFile(this.pathFor(key), file, { flag: 'wx' });
    return key;
  }

  async read(key: string): Promise<Buffer | null> {
    if (!this.owns(key)) return null;
    try {
      return await readFile(this.pathFor(key));
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.owns(key)) return false;
    try {
      await unlink(this.pathFor(key));
      return true;
    } catch {
      return false;
    }
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
