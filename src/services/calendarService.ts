import { CalendarEvent } from '../types';
import { requestGoogleAccessToken, GOOGLE_SCOPES } from './googleToken';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function fetchCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  try {
    // Get user's access token from Firebase
    const accessToken = await getUserAccessToken(userId);
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Fetch today's calendar events from Google Calendar API
    let response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${today.toISOString()}&` +
      `timeMax=${tomorrow.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const freshToken = await requestGoogleAccessToken(GOOGLE_SCOPES);
        if (freshToken) {
          try {
            await setDoc(doc(db, 'users', userId), { accessToken: freshToken, updatedAt: serverTimestamp() }, { merge: true });
          } catch {}
          response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
              `timeMin=${today.toISOString()}&` +
              `timeMax=${tomorrow.toISOString()}&` +
              `singleEvents=true&` +
              `orderBy=startTime`,
            {
              headers: { Authorization: `Bearer ${freshToken}` },
            }
          );
        }
      }
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Parse calendar events
    const events: CalendarEvent[] = data.items.map((item: any) => ({
      id: item.id,
      title: item.summary || 'Untitled Event',
      start: new Date(item.start.dateTime || item.start.date),
      end: new Date(item.end.dateTime || item.end.date),
      description: item.description || '',
      location: item.location || '',
      completed: false,
      color: item.colorId || undefined
    }));
    
    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
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
