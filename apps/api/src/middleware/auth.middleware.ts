import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../lib/auth';

export const authenticate = (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  const token = req.cookies.assetlane_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch (error) {
    res.clearCookie('assetlane_token');
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};
