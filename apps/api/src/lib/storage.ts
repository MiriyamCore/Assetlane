import fs from 'fs';
import path from 'path';

const currentWorkingDirectory = process.cwd();
const workspaceRoot = fs.existsSync(path.join(currentWorkingDirectory, 'apps'))
  ? currentWorkingDirectory
  : path.resolve(currentWorkingDirectory, '../..');

export const storageRoot = process.env.STORAGE_ROOT || path.join(workspaceRoot, 'storage', 'uploads');
export const imageStorageRoot = path.join(storageRoot, 'images');
export const digitalStorageRoot = path.join(storageRoot, 'digital');
export const brandingStorageRoot = path.join(storageRoot, 'branding');
export const themeStorageRoot = path.join(workspaceRoot, 'storage', 'themes');
export const themeInstallRoot = path.join(themeStorageRoot, 'installed');
export const themeUploadRoot = path.join(themeStorageRoot, 'uploads');
export const bundledThemePreviewRoot = path.join(workspaceRoot, 'apps', 'api', 'assets', 'theme-previews');

export const ensureStorageDirectories = () => {
  [storageRoot, imageStorageRoot, digitalStorageRoot, brandingStorageRoot, themeStorageRoot, themeInstallRoot, themeUploadRoot].forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });
};

export const sanitizeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

export const getAbsoluteStoragePath = (relativePath: string) => path.join(storageRoot, relativePath);

export const inferImageMimeType = (filePath: string) => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};
