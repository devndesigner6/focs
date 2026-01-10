import { useState } from 'react';
import { motion } from 'framer-motion';
import { BriefItem } from '../types';
import EnhancedEmailDraftModal from './EnhancedEmailDraftModal';

interface EmailItemProps {
  item: BriefItem;
  index: number;
  onToggle: (id: string) => void;
  accessToken?: string;
}

const EmailItemCard = ({ item, index, onToggle, accessToken }: EmailItemProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = () => {
    if (item.aiDraft && !item.completed) {
      setShowModal(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ 
          delay: index * 0.02,
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="group"
      >
        <button
          onClick={handleCardClick}
          disabled={item.completed || !item.aiDraft}
          className={`
            w-full text-left px-4 py-3 rounded-lg transition-all duration-150
            ${item.completed 
              ? 'opacity-50' 
              : item.aiDraft 
                ? 'hover:bg-[#1a1a1a] active:bg-[#151515] cursor-pointer' 
                : 'cursor-default'
            }
          `}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.id);
              }}
              className="flex-shrink-0 mt-0.5"
              aria-label="Toggle completion"
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className={`
                  w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center
                  transition-all duration-150
                  ${item.completed
                    ? 'bg-[#34C759] border-[#34C759]'
                    : 'border-[#48484a] hover:border-[#636366]'
                  }
                `}
              >
                {item.completed && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 6l3 3 5-6" />
                  </motion.svg>
                )}
              </motion.div>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className={`
                  text-[14px] font-medium leading-snug
                  ${item.completed ? 'text-[#636366] line-through' : 'text-white'}
                `}>
                  {item.title}
                </h3>
                {!item.completed && item.priority === 'high' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A] flex-shrink-0" />
                )}
              </div>
              
              <p className="text-[13px] text-[#8e8e93] leading-snug line-clamp-1">
                {item.subtitle}
              </p>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Enhanced Email Draft Modal */}
      {item.aiDraft && (
        <EnhancedEmailDraftModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          draft={item.aiDraft}
          emailSubject={item.title}
          emailFrom={item.metadata?.from || 'Unknown'}
          emailBody={item.metadata?.snippet || item.subtitle || ''}
          accessToken={accessToken}
          onSent={() => onToggle(item.id)}
        />
      )}
    </>
  );
};

export default EmailItemCard;
