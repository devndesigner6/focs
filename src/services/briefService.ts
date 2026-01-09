import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DailyBrief, BriefItem } from '../types';
import { fetchEmails } from './gmailService';
import { fetchCalendarEvents } from './calendarService';
import { generateAISummary } from './aiService';

export async function fetchDailyBrief(userId: string): Promise<DailyBrief> {
  const today = new Date().toISOString().split('T')[0];
  const briefRef = doc(db, 'users', userId, 'briefs', today);
  
  try {
    const briefDoc = await getDoc(briefRef);
    
    if (briefDoc.exists()) {
      const data = briefDoc.data();
      return {
        id: briefDoc.id,
        date: data.date.toDate(),
        summary: data.summary,
        items: data.items,
        completedCount: data.completedCount || 0,
        totalCount: data.totalCount || 0,
        generatedAt: data.generatedAt.toDate()
      };
    }
    
    // Generate new brief
    return await generateDailyBrief(userId);
  } catch (error) {
    console.error('Error fetching brief:', error);
    throw error;
  }
}

export async function generateDailyBrief(userId: string): Promise<DailyBrief> {
  try {
    // Fetch emails and calendar events
    const [emails, events] = await Promise.all([
      fetchEmails(userId),
      fetchCalendarEvents(userId)
    ]);
    
    // Convert to brief items
    const emailItems: BriefItem[] = emails.map(email => ({
      id: `email-${email.id}`,
      type: 'email',
      title: email.subject,
      subtitle: email.snippet,
      completed: false,
      priority: email.priority,
      metadata: {
        from: email.from
      }
    }));
    
    const calendarItems: BriefItem[] = events.map(event => ({
      id: `calendar-${event.id}`,
      type: 'calendar',
      title: event.title,
      subtitle: event.description || '',
      time: new Date(event.start).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      completed: false,
      metadata: {
        location: event.location,
        description: event.description
      }
    }));
    
    const allItems = [...emailItems, ...calendarItems];
    
    // Generate AI summary
    const summary = await generateAISummary(emails, events);
    
    const brief: DailyBrief = {
      id: new Date().toISOString().split('T')[0],
      date: new Date(),
      summary,
      items: allItems,
      completedCount: 0,
      totalCount: allItems.length,
      generatedAt: new Date()
    };
    
    // Save to Firestore
    const briefRef = doc(db, 'users', userId, 'briefs', brief.id);
    await setDoc(briefRef, {
      ...brief,
      date: serverTimestamp(),
      generatedAt: serverTimestamp()
    });
    
    return brief;
  } catch (error) {
    console.error('Error generating brief:', error);
    throw error;
  }
}

export async function toggleItemCompletion(userId: string, itemId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const briefRef = doc(db, 'users', userId, 'briefs', today);
  
  try {
    const briefDoc = await getDoc(briefRef);
    if (!briefDoc.exists()) return;
    
    const data = briefDoc.data();
    const items = data.items.map((item: BriefItem) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const completedCount = items.filter((item: BriefItem) => item.completed).length;
    
    await updateDoc(briefRef, {
      items,
      completedCount
    });
  } catch (error) {
    console.error('Error toggling item:', error);
    throw error;
  }
}
