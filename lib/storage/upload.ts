import { storageProvider } from './provider';

export async function uploadFile(file: Buffer, extension: string): Promise<string> {
  return storageProvider.upload(file, extension);
}
