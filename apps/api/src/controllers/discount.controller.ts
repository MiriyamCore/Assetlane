import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { validateDiscountDefinition } from '../lib/discount';

export const listDiscountCodes = async (_req: Request, res: Response) => {
  try {
    const codes = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(codes);
  } catch (error) {
    console.error('listDiscountCodes error', error);
    return res.status(500).json({ message: 'Unable to fetch discount codes.' });
  }
};

export const createDiscountCode = async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      code?: string;
      percentOff?: number;
      amountOffCents?: number;
      maxRedemptions?: number;
      active?: boolean;
      expiresAt?: string;
    };

    const definition = validateDiscountDefinition({
      code: body.code || '',
      percentOff: body.percentOff,
      amountOffCents: body.amountOffCents,
      maxRedemptions: body.maxRedemptions,
      active: body.active,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    });

    const created = await prisma.discountCode.create({
      data: definition,
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error('createDiscountCode error', error);
    const message = error instanceof Error ? error.message : 'Unable to create discount code.';
    return res.status(400).json({ message });
  }
};

export const updateDiscountCode = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const body = req.body as {
      code?: string;
      percentOff?: number | null;
      amountOffCents?: number | null;
      maxRedemptions?: number | null;
      active?: boolean;
      expiresAt?: string | null;
    };

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Discount code not found.' });
    }

    const definition = validateDiscountDefinition({
      code: body.code || existing.code,
      percentOff: body.percentOff === undefined ? existing.percentOff : body.percentOff,
      amountOffCents: body.amountOffCents === undefined ? existing.amountOffCents : body.amountOffCents,
      maxRedemptions: body.maxRedemptions === undefined ? existing.maxRedemptions : body.maxRedemptions,
      active: body.active ?? existing.active,
      expiresAt:
        body.expiresAt === undefined
          ? existing.expiresAt
          : body.expiresAt
            ? new Date(body.expiresAt)
            : null,
    });

    const updated = await prisma.discountCode.update({
      where: { id },
      data: definition,
    });

    return res.json(updated);
  } catch (error) {
    console.error('updateDiscountCode error', error);
    const message = error instanceof Error ? error.message : 'Unable to update discount code.';
    return res.status(400).json({ message });
  }
};

export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    await prisma.discountCode.delete({ where: { id: String(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    console.error('deleteDiscountCode error', error);
    return res.status(500).json({ message: 'Unable to delete discount code.' });
  }
};
