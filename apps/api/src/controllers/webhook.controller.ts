import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { WEBHOOK_EVENTS, serializeWebhookEndpoint } from '../lib/webhooks';

const parseEvents = (events: unknown) => {
  if (!Array.isArray(events)) {
    throw new Error('Events must be an array.');
  }

  const normalized = events.map((event) => String(event).trim()).filter(Boolean);
  const invalid = normalized.filter((event) => !WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number]));

  if (invalid.length > 0) {
    throw new Error(`Unsupported webhook events: ${invalid.join(', ')}`);
  }

  return normalized;
};

export const listWebhookEndpoints = async (_req: Request, res: Response) => {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(endpoints.map(serializeWebhookEndpoint));
  } catch (error) {
    console.error('listWebhookEndpoints error', error);
    return res.status(500).json({ message: 'Unable to fetch webhook endpoints.' });
  }
};

export const createWebhookEndpoint = async (req: Request, res: Response) => {
  try {
    const { url, events, active } = req.body as { url?: string; events?: string[]; active?: boolean };

    if (!url?.trim()) {
      return res.status(400).json({ message: 'Webhook URL is required.' });
    }

    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        url: url.trim(),
        secret: crypto.randomBytes(24).toString('hex'),
        events: parseEvents(events || WEBHOOK_EVENTS).join(','),
        active: active ?? true,
      },
    });

    return res.status(201).json(serializeWebhookEndpoint(endpoint));
  } catch (error) {
    console.error('createWebhookEndpoint error', error);
    const message = error instanceof Error ? error.message : 'Unable to create webhook endpoint.';
    return res.status(400).json({ message });
  }
};

export const updateWebhookEndpoint = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { url, events, active } = req.body as { url?: string; events?: string[]; active?: boolean };

    const existing = await prisma.webhookEndpoint.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Webhook endpoint not found.' });
    }

    const endpoint = await prisma.webhookEndpoint.update({
      where: { id },
      data: {
        url: url?.trim() || existing.url,
        events: events ? parseEvents(events).join(',') : existing.events,
        active: active ?? existing.active,
      },
    });

    return res.json(serializeWebhookEndpoint(endpoint));
  } catch (error) {
    console.error('updateWebhookEndpoint error', error);
    const message = error instanceof Error ? error.message : 'Unable to update webhook endpoint.';
    return res.status(400).json({ message });
  }
};

export const deleteWebhookEndpoint = async (req: Request, res: Response) => {
  try {
    await prisma.webhookEndpoint.delete({ where: { id: String(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    console.error('deleteWebhookEndpoint error', error);
    return res.status(500).json({ message: 'Unable to delete webhook endpoint.' });
  }
};

export const rotateWebhookSecret = async (req: Request, res: Response) => {
  try {
    const endpoint = await prisma.webhookEndpoint.update({
      where: { id: String(req.params.id) },
      data: { secret: crypto.randomBytes(24).toString('hex') },
    });

    return res.json(serializeWebhookEndpoint(endpoint));
  } catch (error) {
    console.error('rotateWebhookSecret error', error);
    return res.status(500).json({ message: 'Unable to rotate webhook secret.' });
  }
};
