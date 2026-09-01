import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma';
import { verifyAuthToken } from '../lib/auth';
import { isWritableRole } from '../lib/team';

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

export const authenticate = async (req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) => {
  const token = req.cookies.assetlane_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true },
    });

    if (!user) {
      res.clearCookie('assetlane_token');
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    res.clearCookie('assetlane_token');
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
};

export const requireWriteAccess = (req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!isWritableRole(req.user.role)) {
    return res.status(403).json({ message: 'Viewer accounts have read-only access.' });
  }

  return next();
};

export const requireOwner = (req: Request & { user?: AuthenticatedUser }, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Only store owners can manage team access.' });
  }

  return next();
};
