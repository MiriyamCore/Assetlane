import crypto from 'crypto';
import prisma from './prisma';

export const WEBHOOK_EVENTS = ['order.paid', 'order.refunded'] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

type WebhookPayload = {
  event: WebhookEvent;
  createdAt: string;
  data: Record<string, unknown>;
};

const signPayload = (secret: string, body: string) =>
  crypto.createHmac('sha256', secret).update(body).digest('hex');

export const dispatchWebhookEvent = async (event: WebhookEvent, data: Record<string, unknown>) => {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { active: true },
  });

  const payload: WebhookPayload = {
    event,
    createdAt: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);

  await Promise.all(
    endpoints
      .filter((endpoint) => endpoint.events.split(',').map((value) => value.trim()).includes(event))
      .map(async (endpoint) => {
        try {
          await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Assetlane-Event': event,
              'X-Assetlane-Signature': signPayload(endpoint.secret, body),
            },
            body,
          });
        } catch (error) {
          console.error('dispatchWebhookEvent error', endpoint.url, error);
        }
      }),
  );
};

export const serializeWebhookEndpoint = (endpoint: {
  id: string;
  url: string;
  secret: string;
  events: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: endpoint.id,
  url: endpoint.url,
  secret: endpoint.secret,
  events: endpoint.events.split(',').map((value) => value.trim()).filter(Boolean),
  active: endpoint.active,
  createdAt: endpoint.createdAt,
  updatedAt: endpoint.updatedAt,
});
