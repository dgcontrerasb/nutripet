const PAYPAL_PRODUCTION_URL = 'https://api-m.paypal.com';

export function getAppUrl(): URL {
  const configuredUrl = process.env.APP_URL;
  if (!configuredUrl) {
    throw new Error('APP_URL is not configured.');
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

  const baseUrl = (process.env.PAYPAL_API_BASE_URL || PAYPAL_PRODUCTION_URL).replace(/\/+$/, '');
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
