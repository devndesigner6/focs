import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BriefItem, EmailDraft } from '../types';
import { sendEmail } from '../services/draftService';

interface EmailItemProps {
  item: BriefItem;
  index: number;
  onToggle: (id: string) => void;
  accessToken?: string;
}

const EmailItemCard = ({ item, index, onToggle, accessToken }: EmailItemProps) => {
  const [showDraft, setShowDraft] = useState(false);
  const [draftText, setDraftText] = useState(item.aiDraft?.draftContent || '');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!item.aiDraft || !accessToken) return;
    
    setSending(true);
    const draft: EmailDraft = {
      ...item.aiDraft,
      draftContent: draftText,
      status: 'edited'
    };
    
    const success = await sendEmail(accessToken, draft);
    if (success) {
      onToggle(item.id);
      setShowDraft(false);
    }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl bg-[#0f1112] border border-[#1d1d1d] hover:border-[#2d2d2d] hover:bg-[#121415] transition-all overflow-hidden"
    >
      <div className="flex items-start gap-4 p-4">
        <button
          onClick={() => onToggle(item.id)}
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
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className={`text-base font-medium ${item.completed ? 'text-dark-muted line-through' : 'text-dark-text'}`}>
                {item.title}
              </p>
              <p className="text-sm text-dark-muted mt-1">{item.subtitle}</p>
              {item.metadata?.from && (
                <p className="text-xs text-dark-muted mt-1">From: {item.metadata.from}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!item.completed && item.priority === 'high' && (
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              )}
              <svg className="w-4 h-4 text-[#4a4a4a] group-hover:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {item.aiDraft && !item.completed && (
            <div className="mt-3 pt-3 border-t border-[#1d1d1d]">
              <button
                onClick={() => setShowDraft(!showDraft)}
                className="text-xs px-3 py-1.5 rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Draft Ready
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDraft && item.aiDraft && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#1d1d1d] bg-[#0a0b0c] p-4"
          >
            <p className="text-xs text-dark-muted mb-2">AI-Generated Reply:</p>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-lg bg-[#121214] border border-[#1d1d1d] text-sm text-dark-text focus:outline-none focus:border-accent-blue resize-none"
              placeholder="Edit draft before sending..."
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSend}
                disabled={sending || !accessToken}
                className="px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
              <button
                onClick={() => setShowDraft(false)}
                className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-dark-muted text-sm hover:bg-[#202020] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EmailItemCard;
