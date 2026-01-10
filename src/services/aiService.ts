import { EmailItem, CalendarEvent } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDohffmEbf0Madw_NVHhLoiocNrs2GftTg';

// Email Analysis Types
export interface EmailAnalysis {
  intent: 'question' | 'request' | 'meeting' | 'fyi' | 'urgent' | 'follow-up';
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
  keyPoints: string[];
  suggestedAction: string;
  tone: 'formal' | 'professional' | 'casual' | 'friendly';
  confidence: number; // 0-100
}

export interface DraftVariation {
  length: 'short' | 'medium' | 'detailed';
  content: string;
  tone: string;
}

// Analyze incoming email with AI
export async function analyzeEmail(
  emailSubject: string,
  emailBody: string,
  emailFrom: string
): Promise<EmailAnalysis> {
  try {
    const prompt = `Analyze this email and provide structured insights:

From: ${emailFrom}
Subject: ${emailSubject}
Body: ${emailBody.substring(0, 1000)}

Analyze and respond in this EXACT JSON format:
{
  "intent": "question|request|meeting|fyi|urgent|follow-up",
  "sentiment": "positive|neutral|negative",
  "urgency": "high|medium|low",
  "keyPoints": ["point1", "point2", "point3"],
  "suggestedAction": "brief description of what to do",
  "tone": "formal|professional|casual|friendly",
  "confidence": 85
}

Be precise and analytical.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error('Analysis failed');

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return getFallbackAnalysis();
  } catch (error) {
    console.error('Email analysis error:', error);
    return getFallbackAnalysis();
  }
}

// Generate intelligent email draft
export async function generateEmailDraft(
  emailSubject: string,
  emailBody: string,
  emailFrom: string,
  analysis: EmailAnalysis,
  preferredTone: 'formal' | 'professional' | 'casual' | 'friendly' = 'professional',
  length: 'short' | 'medium' | 'detailed' = 'medium'
): Promise<string> {
  try {
    const lengthGuide = {
      short: '2-3 sentences, very concise',
      medium: '1 short paragraph, 4-5 sentences',
      detailed: '2 paragraphs, comprehensive response'
    };

    const prompt = `You are an expert email writer. Generate a ${preferredTone} reply to this email.

Original Email:
From: ${emailFrom}
Subject: ${emailSubject}
Body: ${emailBody.substring(0, 800)}

Context:
- Intent: ${analysis.intent}
- Urgency: ${analysis.urgency}
- Key points to address: ${analysis.keyPoints.join(', ')}
- Suggested action: ${analysis.suggestedAction}

Requirements:
1. Tone: ${preferredTone}
2. Length: ${lengthGuide[length]}
3. Address all key points naturally
4. Be warm but professional
5. Include a clear call-to-action if needed
6. Sign off appropriately
7. NO subject line, just the email body
8. Start directly with the content (no "Dear" unless formal)

Generate ONLY the email body text, nothing else.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) throw new Error('Draft generation failed');

    const data = await response.json();
    let draft = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the draft
    draft = draft.trim();
    draft = draft.replace(/^["']|["']$/g, ''); // Remove quotes
    
    return draft || getFallbackDraft(analysis);
  } catch (error) {
    console.error('Draft generation error:', error);
    return getFallbackDraft(analysis);
  }
}

// Generate multiple draft variations
export async function generateDraftVariations(
  emailSubject: string,
  emailBody: string,
  emailFrom: string,
  analysis: EmailAnalysis,
  tone: 'formal' | 'professional' | 'casual' | 'friendly' = 'professional'
): Promise<DraftVariation[]> {
  const variations: DraftVariation[] = [];
  
  try {
    // Generate all three lengths in parallel
    const [shortDraft, mediumDraft, detailedDraft] = await Promise.all([
      generateEmailDraft(emailSubject, emailBody, emailFrom, analysis, tone, 'short'),
      generateEmailDraft(emailSubject, emailBody, emailFrom, analysis, tone, 'medium'),
      generateEmailDraft(emailSubject, emailBody, emailFrom, analysis, tone, 'detailed')
    ]);

    variations.push(
      { length: 'short', content: shortDraft, tone },
      { length: 'medium', content: mediumDraft, tone },
      { length: 'detailed', content: detailedDraft, tone }
    );
  } catch (error) {
    console.error('Variation generation error:', error);
  }

  return variations;
}

// Original summary function (kept for compatibility)
export async function generateAISummary(
  emails: EmailItem[],
  events: CalendarEvent[]
): Promise<string> {
  try {
    const emailCount = emails.length;
    const eventCount = events.length;
    
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    
    if (!response.ok) throw new Error('Failed to generate AI summary');
    
    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      generateFallbackSummary(emailCount, eventCount);
    
    return summary.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateFallbackSummary(emails.length, events.length);
  }
}

// Fallback functions
function getFallbackAnalysis(): EmailAnalysis {
  return {
    intent: 'fyi',
    sentiment: 'neutral',
    urgency: 'medium',
    keyPoints: ['Review the email content', 'Respond appropriately'],
    suggestedAction: 'Read and respond to this email',
    tone: 'professional',
    confidence: 50
  };
}

function getFallbackDraft(analysis: EmailAnalysis): string {
  const templates = {
    question: "Thank you for reaching out. I'll look into this and get back to you shortly.\n\nBest regards",
    request: "I've received your request and will address it as soon as possible. I'll keep you updated on the progress.\n\nBest regards",
    meeting: "Thank you for the meeting invitation. I'll review my calendar and confirm my availability soon.\n\nBest regards",
    urgent: "I understand this is urgent. I'm prioritizing this and will respond with more details shortly.\n\nBest regards",
    'follow-up': "Thank you for following up. I appreciate your patience and will provide an update soon.\n\nBest regards",
    fyi: "Thank you for keeping me informed. I've noted this information.\n\nBest regards"
  };

  return templates[analysis.intent] || templates.fyi;
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
