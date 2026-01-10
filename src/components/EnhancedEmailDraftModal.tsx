import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, RotateCw, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { EmailDraft } from '../types';
import { 
  analyzeEmail, 
  generateEmailDraft,
  EmailAnalysis
} from '../services/aiService';
import { sendEmail } from '../services/draftService';

interface EnhancedEmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: EmailDraft;
  emailSubject: string;
  emailFrom: string;
  emailBody: string;
  accessToken?: string;
  onSent?: () => void;
}

type ToneType = 'formal' | 'professional' | 'casual' | 'friendly';

const EnhancedEmailDraftModal = ({ 
  isOpen, 
  onClose,
  draft,
  emailSubject,
  emailFrom,
  emailBody,
  accessToken,
  onSent 
}: EnhancedEmailDraftModalProps) => {
  // State management
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [selectedVariation, setSelectedVariation] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [selectedTone, setSelectedTone] = useState<ToneType>('professional');
  const [sending, setSending] = useState(false);
  const [sendCountdown, setSendCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Analyze email on mount
  useEffect(() => {
    if (isOpen && !analysis) {
      analyzeEmailContent();
    }
  }, [isOpen]);

  // Auto-send countdown
  useEffect(() => {
    if (sendCountdown !== null && sendCountdown > 0) {
      const timer = setTimeout(() => setSendCountdown(sendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sendCountdown === 0) {
      handleSend();
    }
  }, [sendCountdown]);

  const analyzeEmailContent = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeEmail(emailSubject, emailBody, emailFrom);
      setAnalysis(result);
      
      // Auto-generate draft after analysis
      await generateDraft(result, selectedTone, selectedVariation);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze email');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDraft = async (
    analysisData: EmailAnalysis, 
    tone: ToneType, 
    length: 'short' | 'medium' | 'detailed'
  ) => {
    setGenerating(true);
    try {
      const generatedDraft = await generateEmailDraft(
        emailSubject,
        emailBody,
        emailFrom,
        analysisData,
        tone,
        length
      );
      setDraftText(generatedDraft);
      
      // Check confidence for auto-send
      if (analysisData.confidence >= 90 && !isEditing) {
        setSendCountdown(3); // Auto-send in 3 seconds
      }
    } catch (error) {
      console.error('Draft generation failed:', error);
      toast.error('Failed to generate draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!analysis) return;
    setIsEditing(false);
    setSendCountdown(null);
    await generateDraft(analysis, selectedTone, selectedVariation);
  };

  const handleToneChange = async (tone: ToneType) => {
    setSelectedTone(tone);
    if (analysis) {
      await generateDraft(analysis, tone, selectedVariation);
    }
  };

  const handleLengthChange = async (length: 'short' | 'medium' | 'detailed') => {
    setSelectedVariation(length);
    if (analysis) {
      await generateDraft(analysis, selectedTone, length);
    }
  };

  const handleSend = async () => {
    if (!accessToken || sending) return;
    
    setSending(true);
    setSendCountdown(null);
    
    const updatedDraft: EmailDraft = {
      ...draft,
      draftContent: draftText,
      status: 'edited'
    };
    
    const success = await sendEmail(accessToken, updatedDraft);
    
    if (success) {
      setShowConfetti(true);
      toast.success('Email sent successfully! 🎉', {
        duration: 3000,
        icon: '✓',
        style: {
          background: '#34C759',
          color: '#fff',
        }
      });
      
      setTimeout(() => {
        setShowConfetti(false);
        onSent?.();
        onClose();
      }, 2000);
    } else {
      toast.error('Failed to send email');
    }
    
    setSending(false);
  };

  const cancelAutoSend = () => {
    setSendCountdown(null);
    toast('Auto-send cancelled', { icon: '⏸️' });
  };

  // Sentiment emoji
  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      default: return '😐';
    }
  };

  // Urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with Apple-style blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-50"
            />

            {/* Modal with glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 35,
                mass: 0.8
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden bg-white/10 backdrop-blur-3xl border-white/20 shadow-2xl">
                
                {/* Header - Apple style */}
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <Badge variant="secondary" className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/30">
                          AI Reply
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-white/95 tracking-tight">
                        Re: {emailSubject}
                      </h3>
                      <p className="text-xs text-white/50 mt-1">
                        To: {emailFrom}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Analysis Section - Apple style cards */}
                {analyzing ? (
                  <div className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-10 h-10 text-blue-400" />
                      </motion.div>
                      <p className="text-sm text-white/60 font-medium">
                        Analyzing email...
                      </p>
                    </div>
                  </div>
                ) : analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-4 border-b border-white/5"
                  >
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-3 bg-white/5 border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Intent</p>
                        <Badge variant="outline" className="text-xs capitalize border-white/20 text-white/90">
                          {analysis.intent}
                        </Badge>
                      </Card>
                      <Card className="p-3 bg-white/5 border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Sentiment</p>
                        <p className="text-xl">{getSentimentEmoji(analysis.sentiment)}</p>
                      </Card>
                      <Card className="p-3 bg-white/5 border-white/10 text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Urgency</p>
                        <Badge className={`text-xs capitalize ${getUrgencyColor(analysis.urgency)}`}>
                          {analysis.urgency}
                        </Badge>
                      </Card>
                    </div>
                    
                    {analysis.confidence >= 90 && sendCountdown !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <Card className="p-3 bg-green-500/10 border-green-500/20">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-green-300 font-medium">
                              Auto-sending in {sendCountdown}s...
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelAutoSend}
                              className="h-7 text-xs text-white/70 hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Tone & Length Selectors - Apple style */}
                {!analyzing && analysis && (
                  <div className="px-6 py-4 border-b border-white/5 space-y-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2.5 font-medium">Tone</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(['formal', 'professional', 'casual', 'friendly'] as ToneType[]).map((tone) => (
                          <Button
                            key={tone}
                            variant={selectedTone === tone ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleToneChange(tone)}
                            className={`text-xs capitalize ${
                              selectedTone === tone
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                            }`}
                          >
                            {tone}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2.5 font-medium">Length</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(['short', 'medium', 'detailed'] as const).map((length) => (
                          <Button
                            key={length}
                            variant={selectedVariation === length ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleLengthChange(length)}
                            className={`text-xs capitalize ${
                              selectedVariation === length
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                            }`}
                          >
                            {length}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Draft Content - Apple style */}
                <div className="px-6 py-4 max-h-[350px] overflow-y-auto">
                  {generating ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                  ) : (
                    <textarea
                      value={draftText}
                      onChange={(e) => {
                        setDraftText(e.target.value);
                        setIsEditing(true);
                        setSendCountdown(null);
                      }}
                      className="w-full h-56 p-4 rounded-xl bg-white/5 border border-white/10 text-white/95 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none transition-all placeholder:text-white/30 font-normal"
                      placeholder="Your AI-generated draft will appear here..."
                    />
                  )}
                </div>

                {/* Footer Actions - Apple style */}
                <Separator className="bg-white/10" />
                <div className="px-6 py-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateDraft}
                    disabled={generating || analyzing}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={sending || !accessToken || !draftText}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedEmailDraftModal;
