export interface StorageProvider {
  upload(file: File | Buffer, filename: string, mimeType: string): Promise<string>;
  delete(urlOrKey: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  async upload(file: File | Buffer, filename: string, mimeType: string): Promise<string> {
    // In local dev, store as base64 or public data URL
    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
    return `data:${mimeType};base64,${file.toString('base64')}`;
  }

  async delete(_urlOrKey: string): Promise<boolean> {
    return true;
  }
}

export const storageProvider = new LocalStorageProvider();
