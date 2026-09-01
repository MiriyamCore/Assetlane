import { Request, Response } from 'express';
import { getLibrarySession, createLibrarySession, listLibraryPurchases } from '../lib/library';
import { getSettingsMap } from '../lib/settings';
import { serializePurchase } from '../lib/serializers';

export const requestLibraryAccess = async (req: Request, res: Response) => {
  try {
    const email = String((req.body as { email?: string }).email || '').trim();
    await createLibrarySession(email);
    return res.json({
      success: true,
      message: 'If purchases exist for that email, a secure library link has been sent.',
    });
  } catch (error) {
    console.error('requestLibraryAccess error', error);
    const message = error instanceof Error ? error.message : 'Unable to send library link.';
    return res.status(400).json({ message });
  }
};

export const getLibrary = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '').trim();
    const session = await getLibrarySession(token);

    if (!session) {
      return res.status(401).json({ message: 'Library link is invalid or expired.' });
    }

    const purchases = await listLibraryPurchases(session.email);
    const settings = await getSettingsMap();
    const storeUrl = settings.storeUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.json({
      email: session.email,
      expiresAt: session.expiresAt,
      purchases: purchases.map((purchase) => ({
        ...serializePurchase(purchase),
        product: purchase.product,
        downloadUrl: `${storeUrl}/download/${purchase.downloadToken}`,
      })),
    });
  } catch (error) {
    console.error('getLibrary error', error);
    return res.status(500).json({ message: 'Unable to load purchase library.' });
  }
};
