import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { EmailDraft } from '../types';
import { sendEmail } from '../services/draftService';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: EmailDraft;
  emailSubject: string;
  emailFrom: string;
  accessToken?: string;
  onSent?: () => void;
}

const EmailDraftModal = ({ 
  isOpen, 
  onClose,
  draft,
  emailSubject,
  emailFrom,
  accessToken,
  onSent
}: EmailDraftModalProps) => {
  const [draftText, setDraftText] = useState(draft.draftContent);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!accessToken) return;
    
    setSending(true);
    const updatedDraft: EmailDraft = {
      ...draft,
      draftContent: draftText,
      status: 'edited'
    };
    
    const success = await sendEmail(accessToken, updatedDraft);
    if (success) {
      onSent?.();
      onClose();
    }
    setSending(false);
  };

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1c1c1e] rounded-[20px] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-[#2c2c2e]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2c2c2e]">
                <div className="flex-1 pr-4">
                  <p className="text-[10px] text-[#8e8e93] uppercase tracking-wide mb-0.5">
                    {currentDate}
                  </p>
                  <h3 className="text-[15px] font-semibold text-white leading-tight">
                    Re: {emailSubject}
                  </h3>
                  <p className="text-[11px] text-[#636366] mt-1">
                    To: {emailFrom}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#8e8e93]" strokeWidth={2.5} />
                </button>
              </div>

              {/* AI Draft Content */}
              <div className="px-5 py-4 max-h-[500px] overflow-y-auto">
                <p className="text-[10px] text-[#8e8e93] uppercase tracking-wide mb-3">
                  AI-Generated Draft
                </p>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl bg-[#0a0a0a] border border-[#2c2c2e] text-[#e5e5e7] text-[14px] leading-relaxed focus:outline-none focus:border-[#007AFF] resize-none transition-colors placeholder:text-[#636366]"
                  placeholder="Edit your draft here..."
                />
              </div>

              {/* Footer Actions */}
              <div className="px-5 py-4 border-t border-[#2c2c2e] flex items-center justify-end gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#2c2c2e] text-[#e5e5e7] text-[13px] font-medium hover:bg-[#3a3a3c] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSend}
                  disabled={sending || !accessToken}
                  className="px-5 py-2.5 rounded-lg bg-[#34C759] text-white text-[13px] font-semibold hover:bg-[#30B350] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-500/20"
                >
                  {sending ? 'Sending...' : 'Save to Gmail'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmailDraftModal;
