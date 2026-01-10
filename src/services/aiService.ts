import { EmailItem, CalendarEvent } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDohffmEbf0Madw_NVHhLoiocNrs2GftTg';

export async function generateAISummary(
  emails: EmailItem[],
  events: CalendarEvent[]
): Promise<string> {
  try {
    const emailCount = emails.length;
    const eventCount = events.length;
    
    // Create context for AI
    const emailSummaries = emails.slice(0, 5).map(e => 
      `- ${e.subject} from ${e.from}`
    ).join('\n');
    
    const eventSummaries = events.map(e => 
      `- ${e.title} at ${new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    ).join('\n');
    
    const prompt = `You are a calm, professional assistant creating a daily brief. Generate a brief, encouraging summary (2-3 sentences max) for someone's morning.

Today they have:
- ${emailCount} emails requiring attention
- ${eventCount} calendar events

Key emails:
${emailSummaries || 'None'}

Calendar events:
${eventSummaries || 'None'}

Create a brief, calm summary that:
1. Acknowledges what needs attention
2. Highlights 1-2 most important items
3. Ends with an encouraging note
4. Uses a warm, professional tone
5. Keep it under 50 words

Do not use phrases like "Good morning" or greetings. Start directly with the summary.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to generate AI summary');
    }
    
    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      generateFallbackSummary(emailCount, eventCount);
    
    return summary.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateFallbackSummary(emails.length, events.length);
  }
}

function generateFallbackSummary(emailCount: number, eventCount: number): string {
  const time = new Date().getHours();
  const greeting = time < 12 ? 'Good morning' : time < 17 ? 'Good afternoon' : 'Good evening';
  
  if (emailCount === 0 && eventCount === 0) {
    return `${greeting}. You have a clear schedule today. Perfect time to focus on your priorities.`;
  }
  
  if (emailCount > 0 && eventCount > 0) {
    return `${greeting}. Today, you have ${emailCount} email${emailCount > 1 ? 's' : ''} and ${eventCount} calendar event${eventCount > 1 ? 's' : ''} requiring your attention. Prioritizing these will help you stay on track for the day.`;
  }
  
  if (emailCount > 0) {
    return `${greeting}. You have ${emailCount} email${emailCount > 1 ? 's' : ''} that need${emailCount === 1 ? 's' : ''} your attention today. Addressing these will keep your inbox organized.`;
  }
  
  return `${greeting}. You have ${eventCount} calendar event${eventCount > 1 ? 's' : ''} scheduled today. Stay focused and make the most of your time.`;
}
