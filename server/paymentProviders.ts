const PAYPAL_PRODUCTION_URL = 'https://api-m.paypal.com';
const PAYPAL_SANDBOX_URL = 'https://api-m.sandbox.paypal.com';
const WOMPI_PRODUCTION_URL = 'https://production.wompi.co/v1';
const WOMPI_SANDBOX_URL = 'https://sandbox.wompi.co/v1';

export function getAppUrl(): URL {
  const configuredUrl = process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined);
  if (!configuredUrl) {
    throw new Error('APP_URL and Vercel deployment URL are not configured.');
  }

  const appUrl = new URL(configuredUrl);
  if (appUrl.protocol !== 'https:' && appUrl.hostname !== 'localhost') {
    throw new Error('APP_URL must use HTTPS.');
  }

  return appUrl;
}

export async function getPaypalAccessToken(): Promise<{ token: string; baseUrl: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured.');
  }

  const paypalMode = process.env.PAYPAL_MODE?.trim().toLowerCase();
  const modeUrl = paypalMode === 'sandbox'
    ? PAYPAL_SANDBOX_URL
    : paypalMode === 'live' || paypalMode === 'production'
      ? PAYPAL_PRODUCTION_URL
      : undefined;
  if (paypalMode && !modeUrl) {
    throw new Error('PAYPAL_MODE must be sandbox, live, or production.');
  }

  const baseUrl = (process.env.PAYPAL_API_BASE_URL || modeUrl || PAYPAL_PRODUCTION_URL).replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`PayPal authentication failed with status ${response.status}.`);
  }

  const data = await response.json() as { access_token?: string };
  if (!data.access_token) {
    throw new Error('PayPal did not return an access token.');
  }

  return { token: data.access_token, baseUrl };
}

export function getWompiApiBaseUrl(): string {
  const configuredMode = process.env.WOMPI_MODE?.trim().toLowerCase();
  const wompiKey = process.env.WOMPI_PRIVATE_KEY || process.env.WOMPI_PUBLIC_KEY || '';
  const inferredMode = /^(?:prv|pub)_test_/i.test(wompiKey) ? 'sandbox' : undefined;
  const wompiMode = configuredMode || inferredMode;
  const modeUrl = wompiMode === 'sandbox'
    ? WOMPI_SANDBOX_URL
    : wompiMode === 'live' || wompiMode === 'production'
      ? WOMPI_PRODUCTION_URL
      : undefined;
  if (wompiMode && !modeUrl) {
    throw new Error('WOMPI_MODE must be sandbox, live, or production.');
  }

  return (process.env.WOMPI_API_BASE_URL || modeUrl || WOMPI_PRODUCTION_URL).replace(/\/+$/, '');
}
