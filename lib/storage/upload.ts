import { storageProvider } from './provider';

export async function uploadFile(file: File | Buffer, filename: string, mimeType: string): Promise<string> {
  return storageProvider.upload(file, filename, mimeType);
}
