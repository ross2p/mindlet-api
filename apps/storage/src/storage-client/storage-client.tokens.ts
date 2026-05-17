export function getStorageClientToken(bucket: string): string {
  return `STORAGE_CLIENT_${bucket.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}
