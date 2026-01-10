import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { DailyBrief, BriefItem } from '../types';
import { fetchEmails } from './gmailService';
import { fetchCalendarEvents } from './calendarService';
import { generateAISummary } from './aiService';
import { generateEmailDraft } from './draftService';

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
    
    // Convert to brief items with AI drafts for ALL emails
    const emailItems: BriefItem[] = await Promise.all(emails.map(async (email) => {
      // Generate AI draft for every email (not just high-priority)
      const draft = await generateEmailDraft(email);
      return {
        id: `email-${email.id}`,
        type: 'email' as const,
        title: email.subject,
        subtitle: email.snippet,
        completed: false,
        priority: email.priority,
        metadata: {
          from: email.from,
          emailId: email.id
        },
        aiDraft: draft
      };
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
    
    // Derive actionable tasks from emails based on simple keyword rules
    const taskItems: BriefItem[] = emails
      .map((email) => {
        const text = `${email.subject} ${email.snippet}`.toLowerCase();
        let badge: BriefItem['badge'] | undefined;
        if (/\b(reply|respond|answer)\b/.test(text)) badge = 'reply';
        else if (/\b(approve|decide|decision)\b/.test(text)) badge = 'decision';
        else if (/\b(schedule|book|arrange|meet)\b/.test(text)) badge = 'schedule';
        else if (/\b(review|scan|check)\b/.test(text)) badge = 'review';
        else if (/\b(follow\s*up|remind)\b/.test(text)) badge = 'followup';

        if (!badge) return null;

        return {
          id: `task-${email.id}`,
          type: 'task',
          title: email.subject,
          subtitle: email.snippet,
          completed: false,
          priority: email.priority,
          metadata: { from: email.from, emailId: email.id },
          badge,
        } as BriefItem;
      })
      .filter(Boolean) as BriefItem[];

    const allItems = [...emailItems, ...calendarItems, ...taskItems];
    
    // Generate AI summary
    const summary = await generateAISummary(emails, events);
    
    const brief: DailyBrief = {
      id: new Date().toISOString().split('T')[0],
      date: new Date(),
      summary: summary || 'Your daily brief is ready.',
      items: allItems,
      completedCount: 0,
      totalCount: allItems.length,
      generatedAt: new Date()
    };
    
    // Save to Firestore - remove undefined fields
    const briefRef = doc(db, 'users', userId, 'briefs', brief.id);
    const briefData = {
      id: brief.id,
      summary: brief.summary,
      items: brief.items.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle || '',
        completed: item.completed,
        priority: item.priority || 'medium',
        time: item.time || null,
        badge: item.badge || null,
        metadata: item.metadata || {},
        aiDraft: item.aiDraft || null
      })),
      completedCount: brief.completedCount,
      totalCount: brief.totalCount,
      date: serverTimestamp(),
      generatedAt: serverTimestamp()
    };
    await setDoc(briefRef, briefData);
    
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
