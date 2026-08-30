import { getSettingsMap } from './settings';

type BkashTokenResponse = {
  id_token?: string;
  statusMessage?: string;
};

type BkashCreatePaymentResponse = {
  paymentID?: string;
  bkashURL?: string;
  statusMessage?: string;
};

type BkashExecutePaymentResponse = {
  transactionStatus?: string;
  trxID?: string;
  statusMessage?: string;
};

type BkashConfig = {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  sandbox: boolean;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

const getBkashConfig = async (): Promise<BkashConfig> => {
  const settings = await getSettingsMap();
  const appKey = process.env.BKASH_APP_KEY?.trim() || settings.bkashAppKey?.trim() || '';
  const appSecret = process.env.BKASH_APP_SECRET?.trim() || settings.bkashAppSecret?.trim() || '';
  const username = process.env.BKASH_USERNAME?.trim() || settings.bkashUsername?.trim() || '';
  const password = process.env.BKASH_PASSWORD?.trim() || settings.bkashPassword?.trim() || '';
  const sandbox =
    process.env.BKASH_SANDBOX === 'true' ||
    settings.bkashSandbox === 'true' ||
    settings.bkashSandbox === '1';

  if (!appKey || !appSecret || !username || !password) {
    throw new Error('bKash credentials are not configured.');
  }

  return { appKey, appSecret, username, password, sandbox };
};

export const getBkashBaseUrl = (sandbox: boolean) =>
  sandbox ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta' : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

const bkashRequest = async <T>(path: string, options: { method?: string; body?: unknown; token?: string }) => {
  const config = await getBkashConfig();
  const baseUrl = getBkashBaseUrl(config.sandbox);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    username: config.username,
    password: config.password,
  };

  if (options.token) {
    headers.authorization = options.token;
    headers['x-app-key'] = config.appKey;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });

  const payload = (await response.json()) as T & { statusMessage?: string };
  if (!response.ok) {
    throw new Error(payload.statusMessage || `bKash API request failed (${response.status}).`);
  }

  return payload;
};

export const getBkashToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const config = await getBkashConfig();
  const payload = await bkashRequest<BkashTokenResponse>('/tokenized/checkout/token/grant', {
    body: {
      app_key: config.appKey,
      app_secret: config.appSecret,
    },
  });

  if (!payload.id_token) {
    throw new Error(payload.statusMessage || 'Unable to grant bKash token.');
  }

  cachedToken = {
    value: payload.id_token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return payload.id_token;
};

export const createBkashPayment = async (input: {
  amount: number;
  currency: string;
  invoiceNumber: string;
  callbackUrl: string;
}) => {
  if (input.currency.toUpperCase() !== 'BDT') {
    throw new Error('bKash checkout currently supports BDT-priced products only.');
  }

  const token = await getBkashToken();
  const amount = (input.amount / 100).toFixed(2);

  const payload = await bkashRequest<BkashCreatePaymentResponse>('/tokenized/checkout/create', {
    token,
    body: {
      mode: '0011',
      payerReference: input.invoiceNumber,
      callbackURL: input.callbackUrl,
      amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: input.invoiceNumber,
    },
  });

  if (!payload.paymentID || !payload.bkashURL) {
    throw new Error(payload.statusMessage || 'Unable to create bKash payment.');
  }

  return {
    paymentId: payload.paymentID,
    checkoutUrl: payload.bkashURL,
  };
};

export const executeBkashPayment = async (paymentId: string) => {
  const token = await getBkashToken();
  const payload = await bkashRequest<BkashExecutePaymentResponse>('/tokenized/checkout/execute', {
    token,
    body: { paymentID: paymentId },
  });

  return payload;
};

export const isBkashConfigured = async () => {
  try {
    await getBkashConfig();
    return true;
  } catch {
    return false;
  }
};
