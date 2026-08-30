import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { ThemePackageLayout } from '@assetlane/theme-sdk';
import { sanitizeFilename, themeInstallRoot } from './storage';
import { getSettingsMap, upsertSettings } from './settings';
import { formatThemeLintMessage, lintThemePackage } from './theme-lint';

const execFileAsync = promisify(execFile);

export const builtInThemeIds = ['atelier', 'paper', 'ember', 'canvas'] as const;
export const defaultPackageHostTheme = 'canvas' as const;

type BuiltInThemeId = (typeof builtInThemeIds)[number];

type ThemeManifest = {
  id: string;
  title: string;
  description: string;
  version?: string;
  author?: string;
  extends?: BuiltInThemeId;
  stylesheet?: string;
  previewImage?: string;
  minAssetlaneVersion?: string;
  custom?: Record<string, unknown>;
};

export type ThemeRecord = {
  id: string;
  title: string;
  description: string;
  version?: string;
  author?: string;
  baseTheme: BuiltInThemeId;
  source: 'bundled' | 'package';
  stylesheetUrl?: string;
  previewImageUrl?: string;
  downloadUrl?: string;
  minAssetlaneVersion?: string;
  custom?: Record<string, unknown>;
  packageLayout?: ThemePackageLayout;
};

const bundledThemes: ThemeRecord[] = [
  {
    id: 'atelier',
    title: 'Atelier',
    description: 'Polished product studio with cool glass panels and a clean launch aesthetic.',
    baseTheme: 'atelier',
    source: 'bundled',
    previewImageUrl: '/theme-previews/atelier.svg',
  },
  {
    id: 'paper',
    title: 'Paper',
    description: 'Soft editorial storefront with warm surfaces, darker ink, and a calmer feel.',
    baseTheme: 'paper',
    source: 'bundled',
    previewImageUrl: '/theme-previews/paper.svg',
  },
  {
    id: 'ember',
    title: 'Ember',
    description: 'High-energy merchandising theme with warm contrast and punchier call-to-actions.',
    baseTheme: 'ember',
    source: 'bundled',
    previewImageUrl: '/theme-previews/ember.svg',
  },
  {
    id: 'canvas',
    title: 'Canvas',
    description: 'Minimal starter theme with no imposed layout — helpers and contexts only.',
    baseTheme: 'canvas',
    source: 'bundled',
    previewImageUrl: '/theme-previews/canvas.svg',
  },
];

const themeManifestFilename = 'theme.json';
const themeLayoutFilename = 'layout.json';

const isBuiltInThemeId = (value: string): value is BuiltInThemeId => builtInThemeIds.includes(value as BuiltInThemeId);

const readJson = <T>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;

const fileExists = (filePath: string) => {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
};

const directoryExists = (directoryPath: string) => {
  try {
    return fs.statSync(directoryPath).isDirectory();
  } catch {
    return false;
  }
};

const loadPackageLayout = (manifestDirectory: string): ThemePackageLayout | undefined => {
  const layoutPath = path.join(manifestDirectory, themeLayoutFilename);
  if (!fileExists(layoutPath)) {
    return undefined;
  }

  const layout = readJson<ThemePackageLayout>(layoutPath);
  if (layout.home?.sections) {
    const allowed = new Set(['hero', 'featured', 'catalog', 'about']);
    const invalid = layout.home.sections.filter((section) => !allowed.has(section));
    if (invalid.length > 0) {
      throw new Error(`layout.json contains invalid home sections: ${invalid.join(', ')}.`);
    }
  }

  return layout;
};

const findManifestDirectory = (rootDirectory: string): string | null => {
  const queue: Array<{ directory: string; depth: number }> = [{ directory: rootDirectory, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    const manifestPath = path.join(current.directory, themeManifestFilename);
    if (fileExists(manifestPath)) {
      return current.directory;
    }

    if (current.depth >= 3) {
      continue;
    }

    for (const entry of fs.readdirSync(current.directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      queue.push({
        directory: path.join(current.directory, entry.name),
        depth: current.depth + 1,
      });
    }
  }

  return null;
};

const toThemeRecord = (
  manifest: ThemeManifest,
  source: 'bundled' | 'package',
  packageLayout?: ThemePackageLayout,
): ThemeRecord => ({
  id: manifest.id,
  title: manifest.title,
  description: manifest.description,
  version: manifest.version,
  author: manifest.author,
  baseTheme: manifest.extends || defaultPackageHostTheme,
  source,
  stylesheetUrl: manifest.stylesheet ? `/theme-assets/${manifest.id}/${manifest.stylesheet}` : undefined,
  previewImageUrl: manifest.previewImage ? `/theme-assets/${manifest.id}/${manifest.previewImage}` : undefined,
  downloadUrl: source === 'package' ? `/api/themes/${manifest.id}/download` : undefined,
  minAssetlaneVersion: manifest.minAssetlaneVersion,
  custom: manifest.custom,
  packageLayout,
});

const validateManifest = (value: unknown): ThemeManifest => {
  if (!value || typeof value !== 'object') {
    throw new Error('Theme manifest must be a JSON object.');
  }

  const manifest = value as Record<string, unknown>;
  const id = typeof manifest.id === 'string' ? sanitizeFilename(manifest.id) : '';
  const title = typeof manifest.title === 'string' ? manifest.title.trim() : '';
  const description = typeof manifest.description === 'string' ? manifest.description.trim() : '';
  const extendsValue = typeof manifest.extends === 'string' ? manifest.extends.trim() : defaultPackageHostTheme;
  const stylesheet = typeof manifest.stylesheet === 'string' ? manifest.stylesheet.trim() : 'theme.css';
  const previewImage = typeof manifest.previewImage === 'string' ? manifest.previewImage.trim() : undefined;
  const version = typeof manifest.version === 'string' ? manifest.version.trim() : undefined;
  const author = typeof manifest.author === 'string' ? manifest.author.trim() : undefined;
  const minAssetlaneVersion =
    typeof manifest.minAssetlaneVersion === 'string' ? manifest.minAssetlaneVersion.trim() : undefined;
  const custom =
    manifest.custom && typeof manifest.custom === 'object' && !Array.isArray(manifest.custom)
      ? (manifest.custom as Record<string, unknown>)
      : undefined;

  if (!id) {
    throw new Error('Theme manifest requires a valid id.');
  }
  if (!title) {
    throw new Error('Theme manifest requires a title.');
  }
  if (!description) {
    throw new Error('Theme manifest requires a description.');
  }
  if (!isBuiltInThemeId(extendsValue)) {
    throw new Error(`Theme manifest extends must be one of: ${builtInThemeIds.join(', ')}.`);
  }
  if (stylesheet.includes('..') || path.isAbsolute(stylesheet)) {
    throw new Error('Theme manifest stylesheet must stay inside the package.');
  }
  if (previewImage && (previewImage.includes('..') || path.isAbsolute(previewImage))) {
    throw new Error('Theme manifest previewImage must stay inside the package.');
  }

  return {
    id,
    title,
    description,
    version,
    author,
    extends: extendsValue,
    stylesheet,
    previewImage,
    minAssetlaneVersion,
    custom,
  };
};

const loadInstalledTheme = (themeId: string): ThemeRecord | null => {
  const manifestPath = path.join(themeInstallRoot, themeId, themeManifestFilename);
  if (!fileExists(manifestPath)) {
    return null;
  }

  try {
    const manifestDirectory = path.join(themeInstallRoot, themeId);
    const manifest = validateManifest(readJson<ThemeManifest>(manifestPath));
    const stylesheetPath = path.join(manifestDirectory, manifest.stylesheet || 'theme.css');
    if (manifest.stylesheet && !fileExists(stylesheetPath)) {
      throw new Error(`Stylesheet "${manifest.stylesheet}" is missing from theme package.`);
    }
    if (manifest.previewImage) {
      const previewImagePath = path.join(manifestDirectory, manifest.previewImage);
      if (!fileExists(previewImagePath)) {
        throw new Error(`Preview image "${manifest.previewImage}" is missing from theme package.`);
      }
    }

    const packageLayout = loadPackageLayout(manifestDirectory);
    return toThemeRecord(manifest, 'package', packageLayout);
  } catch (error) {
    console.error(`loadInstalledTheme error for ${themeId}`, error);
    return null;
  }
};

export const listAvailableThemes = (): ThemeRecord[] => {
  const installedThemes = directoryExists(themeInstallRoot)
    ? fs
        .readdirSync(themeInstallRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => loadInstalledTheme(entry.name))
        .filter((theme): theme is ThemeRecord => Boolean(theme))
    : [];

  return [...bundledThemes, ...installedThemes];
};

export const getThemeById = (themeId: string | undefined) => {
  if (!themeId) {
    return bundledThemes[0];
  }

  return listAvailableThemes().find((theme) => theme.id === themeId) || bundledThemes[0];
};

export const installThemePackage = async (zipPath: string) => {
  const extractionRoot = path.join(themeInstallRoot, `.extract-${Date.now()}`);
  fs.mkdirSync(extractionRoot, { recursive: true });

  try {
    await execFileAsync('unzip', ['-q', zipPath, '-d', extractionRoot]);

    const manifestDirectory = findManifestDirectory(extractionRoot);
    if (!manifestDirectory) {
      throw new Error(`Theme package must include a ${themeManifestFilename} file.`);
    }

    const manifest = validateManifest(readJson<ThemeManifest>(path.join(manifestDirectory, themeManifestFilename)));
    const stylesheetPath = path.join(manifestDirectory, manifest.stylesheet || 'theme.css');
    const packageLayout = loadPackageLayout(manifestDirectory);

    if (manifest.stylesheet && !fileExists(stylesheetPath)) {
      throw new Error(`Theme package is missing the stylesheet file "${manifest.stylesheet}".`);
    }
    if (manifest.previewImage) {
      const previewImagePath = path.join(manifestDirectory, manifest.previewImage);
      if (!fileExists(previewImagePath)) {
        throw new Error(`Theme package is missing the preview image "${manifest.previewImage}".`);
      }
    }

    const lintResult = lintThemePackage({
      themeId: manifest.id,
      manifestDirectory,
      stylesheetPath,
    });

    if (!lintResult.ok) {
      throw new Error(formatThemeLintMessage(lintResult) || 'Theme package failed validation.');
    }

    const destination = path.join(themeInstallRoot, manifest.id);
    fs.rmSync(destination, { recursive: true, force: true });
    fs.mkdirSync(destination, { recursive: true });

    for (const entry of fs.readdirSync(manifestDirectory)) {
      fs.cpSync(path.join(manifestDirectory, entry), path.join(destination, entry), { recursive: true });
    }

    const normalizedManifest = {
      ...manifest,
      extends: manifest.extends || defaultPackageHostTheme,
    };

    fs.writeFileSync(path.join(destination, themeManifestFilename), JSON.stringify(normalizedManifest, null, 2));
    return {
      theme: toThemeRecord(normalizedManifest, 'package', packageLayout),
      warnings: lintResult.issues.filter((issue) => issue.level === 'warning').map((issue) => issue.message),
    };
  } finally {
    fs.rmSync(extractionRoot, { recursive: true, force: true });
    fs.rmSync(zipPath, { force: true });
  }
};

export const uninstallThemePackage = async (themeId: string) => {
  const theme = loadInstalledTheme(themeId);
  if (!theme) {
    throw new Error('Installed theme not found.');
  }

  fs.rmSync(path.join(themeInstallRoot, themeId), { recursive: true, force: true });

  const settings = await getSettingsMap();
  if (settings.storefrontTheme === themeId) {
    await upsertSettings({ storefrontTheme: defaultPackageHostTheme });
  }

  return listAvailableThemes();
};

export const createThemeDownloadArchive = async (themeId: string) => {
  const theme = loadInstalledTheme(themeId);
  if (!theme) {
    throw new Error('Only installed zip themes can be exported.');
  }

  const sourceDirectory = path.join(themeInstallRoot, themeId);
  const archivePath = path.join(themeInstallRoot, `${themeId}-${Date.now()}.zip`);

  await execFileAsync('zip', ['-rq', archivePath, themeId], {
    cwd: themeInstallRoot,
  });

  return {
    archivePath,
    downloadName: `${themeId}.zip`,
    sourceDirectory,
  };
};
