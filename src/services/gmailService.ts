import { EmailItem } from '../types';
import { requestGoogleAccessToken, GOOGLE_SCOPES } from './googleToken';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function fetchEmails(userId: string): Promise<EmailItem[]> {
  try {
    // Get user's access token from Firebase
    const accessToken = await getUserAccessToken(userId);
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Fetch recent emails from Gmail API
    let response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread OR is:important',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      // Attempt token refresh via GIS on 401/403
      if (response.status === 401 || response.status === 403) {
        const freshToken = await requestGoogleAccessToken(GOOGLE_SCOPES);
        if (freshToken) {
          try {
            await setDoc(doc(db, 'users', userId), { accessToken: freshToken, updatedAt: serverTimestamp() }, { merge: true });
          } catch {}
          response = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread OR is:important',
            {
              headers: { Authorization: `Bearer ${freshToken}` },
            }
          );
        }
      }
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
    }
    
    const data = await response.json();
    
    if (!data.messages || data.messages.length === 0) {
      return [];
    }
    
    // Fetch details for each message
    const emailPromises = data.messages.map(async (message: any) => {
      const detailResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const detail = await detailResponse.json();
      
      // Parse email headers
      const headers = detail.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
      const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();
      
      return {
        id: detail.id,
        from,
        subject,
        snippet: detail.snippet || '',
        date: new Date(date),
        isRead: !detail.labelIds?.includes('UNREAD'),
        completed: false,
        priority: detail.labelIds?.includes('IMPORTANT') ? 'high' : 'medium'
      } as EmailItem;
    });
    
    return await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
    // In a real implementation, you would store and retrieve the OAuth token
    // from Firestore after the user authenticates
    const { db } = await import('../firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().accessToken || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}
