import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { createAuthToken } from '../lib/auth';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ message: 'Email and an 8 character password are required.' });
    }

    const existingAdmin = await prisma.user.findFirst();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: passwordHash,
      },
    });

    const token = createAuthToken(user.id);
    res.cookie('assetlane_token', token, authCookieOptions);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('register error', error);
    return res.status(500).json({ message: 'Unable to register admin account.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createAuthToken(user.id);
    res.cookie('assetlane_token', token, authCookieOptions);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('login error', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('assetlane_token');
  return res.json({ success: true });
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true },
    });

    return res.json({ user });
  } catch (error) {
    console.error('getMe error', error);
    return res.status(500).json({ message: 'Unable to fetch the active user.' });
  }
};
