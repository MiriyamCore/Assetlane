import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma';
import { serializeTeamMember } from '../lib/team';
import type { AuthenticatedUser } from '../middleware/auth.middleware';

type TeamRequest = Request & { user?: AuthenticatedUser };

const parseRole = (value: unknown): UserRole | null => {
  if (value === 'owner' || value === 'admin' || value === 'viewer') {
    return value;
  }
  return null;
};

export const listTeamMembers = async (_req: Request, res: Response) => {
  try {
    const members = await prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return res.json({ members: members.map(serializeTeamMember) });
  } catch (error) {
    console.error('listTeamMembers error', error);
    return res.status(500).json({ message: 'Unable to load team members.' });
  }
};

export const createTeamMember = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body as { email?: string; password?: string; role?: string };
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password || password.length < 8) {
      return res.status(400).json({ message: 'Email and an 8 character password are required.' });
    }

    const nextRole = parseRole(role) || 'admin';
    if (nextRole === 'owner') {
      return res.status(400).json({ message: 'Create admin or viewer accounts. Transfer ownership separately.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(400).json({ message: 'A team member with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const member = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        role: nextRole,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return res.status(201).json({ member: serializeTeamMember(member) });
  } catch (error) {
    console.error('createTeamMember error', error);
    return res.status(500).json({ message: 'Unable to add team member.' });
  }
};

export const updateTeamMember = async (req: TeamRequest, res: Response) => {
  try {
    const memberId = String(req.params.id);
    const { role } = req.body as { role?: string };
    const nextRole = parseRole(role);

    if (!nextRole) {
      return res.status(400).json({ message: 'Role must be owner, admin, or viewer.' });
    }

    const member = await prisma.user.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    if (member.id === req.user?.id && nextRole !== member.role) {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    if (member.role === 'owner' && nextRole !== 'owner') {
      const ownerCount = await prisma.user.count({ where: { role: 'owner' } });
      if (ownerCount <= 1) {
        return res.status(400).json({ message: 'At least one owner account is required.' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: memberId },
      data: { role: nextRole },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return res.json({ member: serializeTeamMember(updated) });
  } catch (error) {
    console.error('updateTeamMember error', error);
    return res.status(500).json({ message: 'Unable to update team member.' });
  }
};

export const deleteTeamMember = async (req: TeamRequest, res: Response) => {
  try {
    const memberId = String(req.params.id);

    if (memberId === req.user?.id) {
      return res.status(400).json({ message: 'You cannot remove your own account.' });
    }

    const member = await prisma.user.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    if (member.role === 'owner') {
      const ownerCount = await prisma.user.count({ where: { role: 'owner' } });
      if (ownerCount <= 1) {
        return res.status(400).json({ message: 'At least one owner account is required.' });
      }
    }

    await prisma.user.delete({ where: { id: memberId } });
    return res.json({ success: true });
  } catch (error) {
    console.error('deleteTeamMember error', error);
    return res.status(500).json({ message: 'Unable to remove team member.' });
  }
};
