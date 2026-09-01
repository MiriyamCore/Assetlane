import { UserRole } from '@prisma/client';

export type TeamMember = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export const serializeTeamMember = (user: { id: string; email: string; role: UserRole; createdAt: Date }): TeamMember => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
});

export const isWritableRole = (role: UserRole) => role === 'owner' || role === 'admin';
