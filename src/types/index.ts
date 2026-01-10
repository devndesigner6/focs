export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  accessToken?: string;
}

export interface EmailItem {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: Date;
  isRead: boolean;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  completed: boolean;
  color?: string;
}

export interface BriefItem {
  id: string;
  type: 'email' | 'calendar' | 'draft' | 'task';
  title: string;
  subtitle: string;
  time?: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
  metadata?: {
    from?: string;
    location?: string;
    description?: string;
    emailId?: string;
    threadId?: string;
    startTime?: string;
    endTime?: string;
    meetingLink?: string;
    colorId?: string;
    snippet?: string;
  };
  aiDraft?: EmailDraft;
  badge?: 'reply' | 'decision' | 'schedule' | 'review' | 'followup';
}

export interface EmailDraft {
  id: string;
  emailId: string;
  subject: string;
  recipient: string;
  draftContent: string;
  generatedAt: Date;
  status: 'pending' | 'edited' | 'sent';
}

export interface DailyBrief {
  id: string;
  date: Date;
  summary: string;
  items: BriefItem[];
  completedCount: number;
  totalCount: number;
  generatedAt: Date;
}

export interface UserSettings {
  aiSummariesEnabled: boolean;
  syncEmailToCalendar: boolean;
  syncCalendarToEmail: boolean;
  nightMode: boolean;
  notificationsEnabled: boolean;
  morningBriefTime: string; // "08:00"
  eveningBriefEnabled?: boolean;
  eveningBriefTime?: string; // "21:00"
}
