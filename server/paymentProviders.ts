const PAYPAL_PRODUCTION_URL = 'https://api-m.paypal.com';
const WOMPI_PRODUCTION_URL = 'https://production.wompi.co/v1';

function getProductionApiUrl(configuredUrl: string | undefined, productionUrl: string, provider: string): string {
  const apiUrl = (configuredUrl || productionUrl).replace(/\/+$/, '');
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    throw new Error(`${provider} API URL is invalid.`);
  }

  const expectedUrl = new URL(productionUrl);
  if (
    parsedUrl.protocol !== 'https:' ||
    parsedUrl.origin !== expectedUrl.origin ||
    parsedUrl.pathname.replace(/\/+$/, '') !== expectedUrl.pathname.replace(/\/+$/, '') ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(`${provider} API must use its production URL.`);
  }

  return apiUrl;
}

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

export function getPaypalApiBaseUrl(): string {
  return getProductionApiUrl(
    process.env.PAYPAL_API_BASE_URL,
    PAYPAL_PRODUCTION_URL,
    'PayPal'
  );
}

export async function getPaypalAccessToken(): Promise<{ token: string; baseUrl: string }> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured.');
  }

  const baseUrl = getPaypalApiBaseUrl();
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
  return getProductionApiUrl(
    process.env.WOMPI_API_BASE_URL,
    WOMPI_PRODUCTION_URL,
    'Wompi'
  );
}
