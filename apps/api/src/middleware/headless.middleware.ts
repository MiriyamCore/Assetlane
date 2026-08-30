import { NextFunction, Request, Response } from 'express';
import { getSettingsMap } from '../lib/settings';

export const requireHeadlessSecret = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await getSettingsMap();
    const provided =
      req.headers['x-assetlane-secret'] ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
      '';

    if (!settings.headlessSecretKey || provided !== settings.headlessSecretKey) {
      return res.status(401).json({ message: 'Valid headless secret key required.' });
    }

    return next();
  } catch (error) {
    console.error('requireHeadlessSecret error', error);
    return res.status(500).json({ message: 'Unable to authenticate headless request.' });
  }
};
