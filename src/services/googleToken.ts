// Lightweight helper to request a fresh Google OAuth access token via Google Identity Services
// Requires index.html to load https://accounts.google.com/gsi/client and env VITE_GOOGLE_CLIENT_ID

declare global {
  interface Window {
    google?: any;
  }
}

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export async function requestGoogleAccessToken(scopes: string[] = GOOGLE_SCOPES): Promise<string | null> {
  if (typeof window === 'undefined' || !window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    console.warn('Google Identity Services not available');
    return null;
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('Missing VITE_GOOGLE_CLIENT_ID. Cannot request Google token.');
    return null;
  }

  // Wrap the callback-based API in a Promise
  return new Promise<string | null>((resolve) => {
    const tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scopes.join(' '),
      prompt: 'consent',
      callback: (resp: any) => {
        if (resp && resp.access_token) {
          resolve(resp.access_token as string);
        } else {
          console.warn('Token client returned no access token', resp);
          resolve(null);
        }
      },
    });

    try {
      tokenClient.requestAccessToken();
    } catch (err) {
      console.error('Error requesting Google access token', err);
      resolve(null);
    }
  });
}
