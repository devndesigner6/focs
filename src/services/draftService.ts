import { EmailItem, EmailDraft } from '../types';

export async function generateEmailDraft(email: EmailItem): Promise<EmailDraft> {
  try {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `You are a professional email assistant. Generate a concise, polite reply to this email.

From: ${email.from}
Subject: ${email.subject}
Body snippet: ${email.snippet}

Generate a brief, professional reply (2-3 sentences max). Be helpful and courteous. Only provide the email body text, no subject line or signatures.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate draft');
    }

    const data = await response.json();
    const draftText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Thank you for your email. I will review this and get back to you shortly.';

    return {
      id: `draft-${email.id}`,
      emailId: email.id,
      subject: `Re: ${email.subject}`,
      recipient: email.from,
      draftContent: draftText.trim(),
      generatedAt: new Date(),
      status: 'pending'
    };
  } catch (error) {
    console.error('Error generating draft:', error);
    // Fallback draft
    return {
      id: `draft-${email.id}`,
      emailId: email.id,
      subject: `Re: ${email.subject}`,
      recipient: email.from,
      draftContent: 'Thank you for your email. I will review this and respond shortly.',
      generatedAt: new Date(),
      status: 'pending'
    };
  }
}

export async function sendEmail(
  accessToken: string,
  draft: EmailDraft
): Promise<boolean> {
  try {
    // Create RFC 2822 formatted message
    const messageParts = [
      `To: ${draft.recipient}`,
      `Subject: ${draft.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      draft.draftContent
    ];
    const message = messageParts.join('\r\n');
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: encodedMessage })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
