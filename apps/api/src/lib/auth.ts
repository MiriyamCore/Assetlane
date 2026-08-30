import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production.');
  }
  return secret || 'assetlane-dev-secret';
};

export const createAuthToken = (userId: string) => jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: '7d' });

export const verifyAuthToken = (token: string) => jwt.verify(token, getJwtSecret()) as { id: string };
