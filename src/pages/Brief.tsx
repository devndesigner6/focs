import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { RefreshCw, Menu } from 'lucide-react';
import { User, DailyBrief } from '../types';
import { fetchDailyBrief, toggleItemCompletion } from '../services/briefService';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Settings from '../components/Settings';
import EmailItemCard from '../components/EmailItemCard';
import EveningSummary from '../components/EveningSummary';
import DebugOverlay from '../components/DebugOverlay';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface BriefProps {
  user: User;
}

const Brief = ({ user }: BriefProps) => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const loadBrief = async () => {
    try {
      setLoading(true);
      const data = await fetchDailyBrief(user.uid);
      setBrief(data);
    } catch (error) {
      console.error('Error loading brief:', error);
      // If error is 403, user needs to connect Google
      if (error instanceof Error && error.message.includes('403')) {
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
    loadAccessToken();
  }, [user.uid]);

  const loadAccessToken = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setAccessToken(userDoc.data().accessToken || null);
      }
    } catch (error) {
      console.error('Error loading access token:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBrief();
    setRefreshing(false);
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

  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 17;
  const isMorning = currentHour < 12;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0b0c]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-dark-muted">
          Loading your brief...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0c] flex items-center justify-center p-4 md:p-10">
      <DebugOverlay />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="hover:bg-[#1a1a1a] text-dark-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="hover:bg-[#1a1a1a] text-dark-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            {/* Show Evening Summary after 5 PM */}
            {isEvening && brief ? (
              <EveningSummary brief={brief} />
            ) : (
              <>
                {/* Date - Always show current date */}
                <h1 className="text-2xl font-normal text-dark-text">
                  {format(new Date(), 'EEEE, MMMM d')}
                </h1>

                {/* Greeting Message */}
                {brief && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base text-dark-text leading-relaxed"
              >
                {isEvening ? (
                  brief.completedCount > 0 ? (
                    `Productive day. You completed ${brief.completedCount} of ${brief.totalCount} items. A solid foundation for tomorrow.`
                  ) : (
                    `You had ${brief.totalCount} items today. Take a breath; tomorrow is another chance.`
                  )
                ) : isMorning === true ? (
                  `Good morning. Today, you have ${brief.items.filter(i => i.type === 'email').length} emails that require your attention, including important items like "${brief.items.find(i => i.type === 'email')?.title || 'your tasks'}" and the "${brief.items.find(i => i.type === 'calendar')?.title || 'upcoming meetings'}". Prioritizing these will help you stay on track for the day.`
                ) : (
                  `Good afternoon. You have ${brief.totalCount} items to review. ${brief.items.filter(i => i.type === 'email').length} emails and ${brief.items.filter(i => i.type === 'calendar').length} calendar events need your attention.`
                )}
                  </motion.p>
                )}

                {/* Items List */}
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
              {brief && brief.items.length > 0 ? (
                <AnimatePresence>
                  {brief.items.map((item, index) => (
                    item.type === 'email' ? (
                      <EmailItemCard
                        key={item.id}
                        item={item}
                        index={index}
                        onToggle={handleToggleItem}
                        accessToken={accessToken || undefined}
                      />
                    ) : (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className="group flex items-start gap-3 p-4 rounded-xl bg-[#111111] border border-[#1a1a1a] hover:border-[#252525] hover:bg-[#131313] transition-all"
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleItem(item.id)}
                          className="mt-0.5"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${item.completed ? 'text-dark-muted line-through' : 'text-dark-text'}`}>
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-dark-muted mt-1">{item.subtitle}</p>
                              )}
                              {item.metadata?.location && (
                                <p className="text-xs text-dark-muted mt-1">
                                  📍 {item.metadata.location}
                                </p>
                              )}
                            </div>
                            
                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {item.time && (
                                <Badge variant="time">
                                  {item.time}
                                </Badge>
                              )}
                              {item.type === 'calendar' && (
                                <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400">
                                  📅
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-dark-muted"
                >
                  <p className="text-base">No items for today</p>
                  <p className="text-sm mt-2">Your brief will appear here once you have emails or calendar events.</p>
                </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
              <span className="text-sm text-dark-muted">
                {brief && brief.items.length > 0 ? `${brief.completedCount} items completed` : ''}
              </span>
                  <span className="text-xl font-light text-dark-muted">
                    focs<span className="text-accent-blue">.</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <Settings user={user} onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d0d0d;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #252525;
        }
      `}</style>
    </div>
  );
};

export default Brief;
