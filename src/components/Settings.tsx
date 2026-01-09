import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserSettings } from '../types';

interface SettingsProps {
  user: User;
  onClose: () => void;
}

const Settings = ({ user, onClose }: SettingsProps) => {
  const defaultSettings: UserSettings = {
    aiSummariesEnabled: true,
    syncEmailToCalendar: false,
    syncCalendarToEmail: false,
    nightMode: true,
    notificationsEnabled: false,
    morningBriefTime: '08:00',
    eveningBriefEnabled: true,
    eveningBriefTime: '21:00'
  };

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [user.uid]);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'preferences'));
      if (settingsDoc.exists()) {
        const stored = settingsDoc.data() as UserSettings;
        // Merge to ensure new fields get defaults without breaking existing users
        setSettings({ ...defaultSettings, ...stored });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Settings Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0f10] border-l border-[#1c1c1c] z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-dark-muted tracking-[0.18em] mb-1">SETTINGS</p>
              <h2 className="text-2xl font-light">Control panel</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center text-dark-muted">Loading settings...</div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-xs text-dark-muted tracking-[0.18em]">AI SUMMARIES</h3>
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1c1c1c] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark-text">Enable AI Summaries</p>
                    <p className="text-sm text-dark-muted">Generate intelligent daily briefs</p>
                  </div>
                  <button
                    onClick={() => updateSetting('aiSummariesEnabled', !settings.aiSummariesEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.aiSummariesEnabled ? 'bg-accent-blue' : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.aiSummariesEnabled ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs text-dark-muted tracking-[0.18em]">EXPERIMENTAL</h3>
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1c1c1c] opacity-70">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark-text">Sync Email to Calendar</p>
                      <p className="text-sm text-dark-muted">Create calendar events from emails</p>
                    </div>
                    <div className="relative w-12 h-6 rounded-full bg-[#1f1f1f]" aria-hidden>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark-text">Sync Calendar to Email</p>
                      <p className="text-sm text-dark-muted">Include events in email briefs</p>
                    </div>
                    <div className="relative w-12 h-6 rounded-full bg-[#1f1f1f]" aria-hidden>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs text-dark-muted tracking-[0.18em]">NOTIFICATIONS</h3>
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1c1c1c] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark-text">Morning Brief</p>
                      <p className="text-sm text-dark-muted">Daily at {settings.morningBriefTime || '08:00'}</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.notificationsEnabled ? 'bg-accent-blue' : 'bg-[#2a2a2a]'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.notificationsEnabled ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-dark-text">Evening Summary</p>
                      <p className="text-sm text-dark-muted">Reminder at {settings.eveningBriefTime || '21:00'}</p>
                    </div>
                    <button
                      onClick={() => updateSetting('eveningBriefEnabled', !settings.eveningBriefEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.eveningBriefEnabled ? 'bg-accent-blue' : 'bg-[#2a2a2a]'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.eveningBriefEnabled ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs text-dark-muted tracking-[0.18em]">PRIVACY</h3>
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1c1c1c] space-y-2 text-sm text-dark-muted">
                  <p>Reads your local data only</p>
                  <p>No data leaves your device</p>
                  <p>Stored encrypted on disk</p>
                  <p>Read-only — never sends or modifies messages</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs text-dark-muted tracking-[0.18em]">ACCOUNT</h3>
                <div className="p-5 rounded-2xl bg-[#121214] border border-[#1c1c1c] space-y-3">
                  <div>
                    <p className="text-sm text-dark-muted mb-1">Signed in as</p>
                    <p className="font-semibold text-dark-text">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center text-sm text-dark-muted">
                <p>Focs v1.0.0 · Built to stay calm</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Settings;
