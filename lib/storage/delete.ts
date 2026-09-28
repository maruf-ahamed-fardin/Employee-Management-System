import { storageProvider } from './provider';

export async function deleteFile(urlOrKey: string): Promise<boolean> {
  return storageProvider.delete(urlOrKey);
}
