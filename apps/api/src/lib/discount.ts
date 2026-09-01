import prisma from './prisma';

export type DiscountInput = {
  code: string;
  percentOff?: number | null;
  amountOffCents?: number | null;
  maxRedemptions?: number | null;
  active?: boolean;
  expiresAt?: Date | null;
};

export type AppliedDiscount = {
  discountCodeId: string;
  code: string;
  originalAmountCents: number;
  discountAmountCents: number;
  finalAmountCents: number;
};

const normalizeCode = (value: string) => value.trim().toUpperCase();

export const validateDiscountDefinition = (input: DiscountInput) => {
  const code = normalizeCode(input.code);
  if (!code) {
    throw new Error('Discount code is required.');
  }

  const percentOff = input.percentOff ?? null;
  const amountOffCents = input.amountOffCents ?? null;

  if ((percentOff == null && amountOffCents == null) || (percentOff != null && amountOffCents != null)) {
    throw new Error('Set either a percent off or a fixed amount off.');
  }

  if (percentOff != null && (percentOff < 1 || percentOff > 100)) {
    throw new Error('Percent off must be between 1 and 100.');
  }

  if (amountOffCents != null && amountOffCents < 1) {
    throw new Error('Amount off must be greater than zero.');
  }

  if (input.maxRedemptions != null && input.maxRedemptions < 1) {
    throw new Error('Max redemptions must be at least 1.');
  }

  return {
    code,
    percentOff,
    amountOffCents,
    maxRedemptions: input.maxRedemptions ?? null,
    active: input.active ?? true,
    expiresAt: input.expiresAt ?? null,
  };
};

export const calculateDiscount = (priceCents: number, discount: { percentOff: number | null; amountOffCents: number | null }) => {
  if (priceCents <= 0) {
    return { discountAmountCents: 0, finalAmountCents: 0 };
  }

  const discountAmountCents = discount.percentOff
    ? Math.min(priceCents, Math.round((priceCents * discount.percentOff) / 100))
    : Math.min(priceCents, discount.amountOffCents || 0);

  return {
    discountAmountCents,
    finalAmountCents: Math.max(0, priceCents - discountAmountCents),
  };
};

export const resolveDiscountForCheckout = async (code: string | undefined, priceCents: number) => {
  if (!code?.trim()) {
    return null;
  }

  const discountCode = await prisma.discountCode.findUnique({
    where: { code: normalizeCode(code) },
  });

  if (!discountCode || !discountCode.active) {
    throw new Error('Discount code is not valid.');
  }

  if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
    throw new Error('Discount code has expired.');
  }

  if (discountCode.maxRedemptions != null && discountCode.redemptionCount >= discountCode.maxRedemptions) {
    throw new Error('Discount code has reached its redemption limit.');
  }

  const pricing = calculateDiscount(priceCents, discountCode);

  return {
    discountCodeId: discountCode.id,
    code: discountCode.code,
    originalAmountCents: priceCents,
    discountAmountCents: pricing.discountAmountCents,
    finalAmountCents: pricing.finalAmountCents,
  } satisfies AppliedDiscount;
};

export const incrementDiscountRedemption = async (discountCodeId: string | null | undefined) => {
  if (!discountCodeId) {
    return;
  }

  await prisma.discountCode.update({
    where: { id: discountCodeId },
    data: { redemptionCount: { increment: 1 } },
  });
};
