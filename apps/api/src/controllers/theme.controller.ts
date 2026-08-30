import fs from 'fs';
import { Request, Response } from 'express';
import { createThemeDownloadArchive, installThemePackage, listAvailableThemes, uninstallThemePackage } from '../lib/themes';

export const getAdminThemes = async (_req: Request, res: Response) => {
  try {
    return res.json({ themes: listAvailableThemes() });
  } catch (error) {
    console.error('getAdminThemes error', error);
    return res.status(500).json({ message: 'Unable to fetch theme catalog.' });
  }
};

export const installTheme = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Theme zip file is required.' });
  }

  try {
    const result = await installThemePackage(file.path);
    return res.status(201).json({
      theme: result.theme,
      themes: listAvailableThemes(),
      warnings: result.warnings,
    });
  } catch (error) {
    console.error('installTheme error', error);
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to install theme package.',
    });
  }
};

export const uninstallTheme = async (req: Request, res: Response) => {
  try {
    const themes = await uninstallThemePackage(String(req.params.id));
    return res.json({ themes });
  } catch (error) {
    console.error('uninstallTheme error', error);
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to uninstall theme package.',
    });
  }
};

export const downloadTheme = async (req: Request, res: Response) => {
  try {
    const { archivePath, downloadName } = await createThemeDownloadArchive(String(req.params.id));

    res.download(archivePath, downloadName, (error) => {
      fs.rmSync(archivePath, { force: true });
      if (error && !res.headersSent) {
        res.status(500).json({ message: 'Unable to download theme package.' });
      }
    });
  } catch (error) {
    console.error('downloadTheme error', error);
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to export theme package.',
    });
  }
};
