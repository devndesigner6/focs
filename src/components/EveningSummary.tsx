import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle2, Calendar, Mail } from 'lucide-react';
import { DailyBrief } from '../types';
import { Card } from './ui/card';

interface EveningSummaryProps {
  brief: DailyBrief;
}

const EveningSummary = ({ brief }: EveningSummaryProps) => {
  const completedEmails = brief.items.filter(i => i.type === 'email' && i.completed).length;
  const completedEvents = brief.items.filter(i => i.type === 'calendar' && i.completed).length;
  const totalEmails = brief.items.filter(i => i.type === 'email').length;
  const totalEvents = brief.items.filter(i => i.type === 'calendar').length;
  
  const completionRate = brief.totalCount > 0 
    ? Math.round((brief.completedCount / brief.totalCount) * 100) 
    : 0;

  const getMessage = () => {
    if (completionRate >= 80) {
      return "Exceptional work today. You've tackled your priorities with focus and determination. This momentum will carry into tomorrow.";
    } else if (completionRate >= 50) {
      return "Productive day. You completed the majority of your tasks. Each step forward builds a stronger foundation for tomorrow.";
    } else if (completionRate > 0) {
      return "You made progress today. Every completed task matters. Tomorrow brings fresh opportunities to build on what you've started.";
    } else {
      return "Today was challenging. That's okay. Rest well, and approach tomorrow with renewed energy. Small steps lead to big changes.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Date */}
      <h1 className="text-2xl font-normal text-dark-text">
        {format(new Date(), 'EEEE, MMMM d')}
      </h1>

      {/* Evening Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-base text-dark-text leading-relaxed"
      >
        {getMessage()}
      </motion.p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Rate */}
        <Card className="p-6 bg-[#111111] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-accent-green" />
            <span className="text-sm text-dark-muted">Completion Rate</span>
          </div>
          <div className="text-3xl font-semibold text-dark-text">
            {completionRate}%
          </div>
          <div className="text-xs text-dark-muted mt-1">
            {brief.completedCount} of {brief.totalCount} items
          </div>
        </Card>

        {/* Emails */}
        <Card className="p-6 bg-[#111111] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-accent-blue" />
            <span className="text-sm text-dark-muted">Emails</span>
          </div>
          <div className="text-3xl font-semibold text-dark-text">
            {completedEmails}/{totalEmails}
          </div>
          <div className="text-xs text-dark-muted mt-1">
            {totalEmails - completedEmails} remaining
          </div>
        </Card>

        {/* Calendar Events */}
        <Card className="p-6 bg-[#111111] border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-dark-muted">Events</span>
          </div>
          <div className="text-3xl font-semibold text-dark-text">
            {completedEvents}/{totalEvents}
          </div>
          <div className="text-xs text-dark-muted mt-1">
            {totalEvents - completedEvents} remaining
          </div>
        </Card>
      </div>

      {/* Completed Items List */}
      {brief.completedCount > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-dark-text">Completed Today</h2>
          <div className="space-y-2">
            {brief.items
              .filter(item => item.completed)
              .map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#111111] border border-[#1a1a1a]"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-text truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-dark-muted truncate">{item.subtitle}</p>
                    )}
                  </div>
                  {item.type === 'email' && (
                    <Mail className="w-3 h-3 text-dark-muted flex-shrink-0" />
                  )}
                  {item.type === 'calendar' && (
                    <Calendar className="w-3 h-3 text-dark-muted flex-shrink-0" />
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Tomorrow Preview */}
      <Card className="p-6 bg-gradient-to-br from-[#111111] to-[#0d0d0d] border-[#1a1a1a]">
        <h3 className="text-base font-medium text-dark-text mb-2">Tomorrow</h3>
        <p className="text-sm text-dark-muted leading-relaxed">
          Rest well tonight. Your brief will be ready at 8 AM with fresh priorities and a clear path forward.
        </p>
      </Card>
    </motion.div>
  );
};

export default EveningSummary;
