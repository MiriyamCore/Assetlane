import { NextFunction, Request, Response } from 'express';
import { isSetupComplete } from '../lib/setup';
import { PRODUCT_NAME } from '../lib/platform';

export const requireSetupComplete = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (await isSetupComplete()) {
      return next();
    }

    return res.status(503).json({ message: `${PRODUCT_NAME} setup is not complete.`, code: 'SETUP_REQUIRED' });
  } catch (error) {
    console.error('requireSetupComplete error', error);
    return res.status(500).json({ message: 'Unable to verify setup status.' });
  }
};

export const requireSetupIncomplete = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await isSetupComplete())) {
      return next();
    }

    return res.status(400).json({ message: 'Setup has already been completed.' });
  } catch (error) {
    console.error('requireSetupIncomplete error', error);
    return res.status(500).json({ message: 'Unable to verify setup status.' });
  }
};
