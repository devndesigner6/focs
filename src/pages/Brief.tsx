import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { User, DailyBrief, UserSettings } from '../types';
import { fetchDailyBrief, toggleItemCompletion } from '../services/briefService';
import Settings from '../components/Settings';
import { db, auth, googleProvider } from '../firebase';

interface BriefProps {
  user: User;
}

const defaultSettings: UserSettings = {
  aiSummariesEnabled: true,
  syncEmailToCalendar: false,
  syncCalendarToEmail: false,
  nightMode: true,
  notificationsEnabled: false,
  morningBriefTime: '08:00',
  eveningBriefEnabled: true,
  eveningBriefTime: '21:00',
};

const Brief = ({ user }: BriefProps) => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [connectBusy, setConnectBusy] = useState(false);

  const loadBrief = async () => {
    try {
      setLoading(true);
      const data = await fetchDailyBrief(user.uid);
      setBrief(data);
    } catch (error) {
      console.error('Error loading brief:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
  }, [user.uid]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBrief();
    setRefreshing(false);
  };

  const handleConnectGoogle = async () => {
    try {
      setConnectBusy(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (result.user) {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            email: result.user.email || '',
            displayName: result.user.displayName || '',
            photoURL: result.user.photoURL || '',
            accessToken: accessToken || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      await handleRefresh();
    } catch (e) {
      console.error('Google connect failed', e);
    } finally {
      setConnectBusy(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!brief) return;
    try {
      await toggleItemCompletion(user.uid, itemId);
      setBrief({
        ...brief,
        items: brief.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
        completedCount: brief.items.filter((item) =>
          item.id === itemId ? !item.completed : item.completed
        ).length,
      });
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserSettings({ ...defaultSettings, ...snap.data() } as UserSettings);
        } else {
          setUserSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadUserSettings();
  }, [user.uid]);

  useEffect(() => {
    if (!userSettings?.eveningBriefEnabled || !brief) return;

    let timeoutId: number;

    const scheduleNotification = async () => {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const parseTime = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return { h: h ?? 21, m: m ?? 0 };
      };

      const { h, m } = parseTime(userSettings.eveningBriefTime || '21:00');
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);

      const delay = target.getTime() - now.getTime();
      timeoutId = window.setTimeout(() => {
        const body = brief.summary || `You have ${brief.totalCount} items today.`;
        new Notification('Today in focs', { body, silent: false });
        scheduleNotification();
      }, delay);
    };

    scheduleNotification();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [brief, userSettings]);

  const isEvening = new Date().getHours() >= 17;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-dark-muted">
          Loading your brief...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0c] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl rounded-[28px] border border-[#1c1c1c] bg-[#0f1011] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        <div className="px-6 md:px-10 py-7 border-b border-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center gap-3 text-dark-muted">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm uppercase tracking-[0.18em]">Daily Brief</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-dark-muted">Updated just now</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh"
            >
              <svg
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleConnectGoogle}
              disabled={connectBusy}
              className="px-3 py-2 rounded-lg bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {connectBusy ? 'Connecting…' : 'Connect Google'}
            </button>
          </div>
        </div>

        <div className="px-6 md:px-10 py-8 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold text-dark-text">{format(new Date(), 'EEEE, MMMM d')}</h1>
            {brief && (
              <p className="text-base md:text-lg text-dark-text leading-relaxed">
                {isEvening
                  ? brief.completedCount > 0
                    ? `Productive day. You completed ${brief.completedCount} of ${brief.totalCount} items. A solid foundation for tomorrow.`
                    : `You had ${brief.totalCount} items today. Take a breath; tomorrow is another chance.`
                  : brief.summary}
              </p>
            )}
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {brief && brief.items.length > 0 ? (
              <AnimatePresence>
                {brief.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.04 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-[#0f1112] border border-[#1d1d1d] hover:border-[#2d2d2d] hover:bg-[#121415] transition-all"
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="mt-1 flex-shrink-0"
                      aria-label="Toggle completion"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-accent-green/90 border-accent-green'
                            : 'border-[#3a3a3a] group-hover:border-accent-blue'
                        }`}
                      >
                        {item.completed && (
                          <svg className="w-3 h-3 text-black" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.01 7.01a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8.7 11.586l6.303-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-base font-medium ${item.completed ? 'text-dark-muted line-through' : 'text-dark-text'}`}>
                            {item.title}
                          </p>
                          <p className="text-sm text-dark-muted mt-1">{item.subtitle}</p>
                          {item.metadata?.from && (
                            <p className="text-xs text-dark-muted mt-1">From: {item.metadata.from}</p>
                          )}
                          {item.metadata?.location && (
                            <p className="text-xs text-dark-muted mt-1">📍 {item.metadata.location}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.type === 'calendar' && item.time && (
                            <span className="text-xs px-2 py-1 rounded-lg bg-[#1c2531] text-accent-blue">{item.time}</span>
                          )}
                          {!item.completed && item.priority === 'high' && (
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                          )}
                          <svg className="w-4 h-4 text-[#4a4a4a] group-hover:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-dark-muted">
                <p className="text-lg mb-2">Connect Gmail + Calendar</p>
                <p className="text-sm mb-4">We couldn't load any items. Connect Google to generate your brief.</p>
                <button
                  onClick={handleConnectGoogle}
                  disabled={connectBusy}
                  className="px-4 py-2 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {connectBusy ? 'Connecting…' : 'Connect Google'}
                </button>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-dark-muted pt-2">
            {brief && brief.items.length > 0 ? <span>{brief.completedCount} of {brief.totalCount} completed</span> : <span />}
            <div className="flex items-center gap-2">
              {userSettings?.eveningBriefEnabled && (
                <span className="text-xs px-2 py-1 rounded-lg bg-[#131313] border border-[#1f1f1f]">Evening summary at {userSettings.eveningBriefTime || '21:00'}</span>
              )}
              <span className="text-2xl font-light text-dark-muted">focs<span className="text-accent-blue">.</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <Settings user={user} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Brief;
