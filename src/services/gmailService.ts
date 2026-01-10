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
    
    // Fetch recent emails from Gmail API - get more to filter with AI
    let response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=is:unread OR is:important OR newer_than:1d',
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
    
    const allEmails = await Promise.all(emailPromises);
    
    // AI-powered filtering: Only show actionable/important emails
    const importantEmails = await filterImportantEmails(allEmails);
    
    return importantEmails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

// AI-powered email filtering - only show important/actionable emails
async function filterImportantEmails(emails: EmailItem[]): Promise<EmailItem[]> {
  // Keywords that indicate importance or action needed
  const urgentKeywords = /\b(urgent|asap|important|deadline|today|tomorrow|meeting|call|review|approve|decision|action required|time sensitive)\b/i;
  const spamKeywords = /\b(unsubscribe|newsletter|promotion|sale|discount|offer|deal|free|win|prize)\b/i;
  
  const filtered = emails.filter(email => {
    const text = `${email.subject} ${email.snippet}`.toLowerCase();
    
    // Skip spam/promotional emails
    if (spamKeywords.test(text)) {
      return false;
    }
    
    // Include if marked important by Gmail
    if (email.priority === 'high') {
      return true;
    }
    
    // Include if contains urgent keywords
    if (urgentKeywords.test(text)) {
      return true;
    }
    
    // Include if from known important senders (you can customize this)
    const importantDomains = ['@company.com', '@client.com', 'boss', 'manager', 'ceo'];
    if (importantDomains.some(domain => email.from.toLowerCase().includes(domain))) {
      return true;
    }
    
    // Include if unread and recent (within 24 hours)
    const hoursSinceReceived = (Date.now() - email.date.getTime()) / (1000 * 60 * 60);
    if (!email.isRead && hoursSinceReceived < 24) {
      return true;
    }
    
    return false;
  });
  
  // Limit to top 5-7 most important
  return filtered.slice(0, 7);
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
