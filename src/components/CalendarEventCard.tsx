import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import { format, differenceInMinutes, isPast } from 'date-fns';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
  description?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      uri: string;
      entryPointType: string;
    }>;
  };
  colorId?: string;
}

interface CalendarEventCardProps {
  event: CalendarEvent;
  index: number;
}

const CalendarEventCard = ({ event, index }: CalendarEventCardProps) => {
  const startTime = new Date(event.start.dateTime);
  const endTime = new Date(event.end.dateTime);
  const now = new Date();
  
  const minutesUntil = differenceInMinutes(startTime, now);
  const isHappening = now >= startTime && now <= endTime;
  const hasEnded = isPast(endTime);
  
  // Extract meeting link
  const meetingLink = event.hangoutLink || 
    event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

  // Color coding based on calendar or status
  const getEventColor = () => {
    if (hasEnded) return 'bg-[#1a1a1a] border-[#2a2a2a]';
    if (isHappening) return 'bg-[#1a2a1a] border-[#2a4a2a]';
    if (minutesUntil <= 15) return 'bg-[#2a1a1a] border-[#4a2a2a]';
    return 'bg-[#111111] border-[#1a1a1a]';
  };

  const getTimeUntilText = () => {
    if (hasEnded) return 'Ended';
    if (isHappening) return 'Happening now';
    if (minutesUntil <= 0) return 'Starting now';
    if (minutesUntil < 60) return `in ${minutesUntil}m`;
    const hours = Math.floor(minutesUntil / 60);
    return `in ${hours}h ${minutesUntil % 60}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-5 rounded-xl border transition-all duration-300 hover:border-[#3a3a3a] ${getEventColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-white mb-1 leading-tight">
            {event.summary}
          </h3>
          
          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <Badge 
          variant={isHappening ? 'default' : 'secondary'}
          className={`
            text-xs font-medium shrink-0
            ${isHappening ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
            ${minutesUntil <= 15 && !isHappening ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
            ${hasEnded ? 'bg-gray-500/20 text-gray-500 border-gray-500/30' : ''}
          `}
        >
          {getTimeUntilText()}
        </Badge>
      </div>

      {/* Details */}
      {(event.location || event.description) && (
        <>
          <Separator className="my-3" />
          <div className="space-y-2">
            {event.location && (
              <div className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
            
            {event.description && (
              <p className="text-sm text-gray-500 line-clamp-2 pl-5">
                {event.description}
              </p>
            )}
          </div>
        </>
      )}

      {/* Meeting Link */}
      {meetingLink && !hasEnded && (
        <>
          <Separator className="my-3" />
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] text-white"
            onClick={() => window.open(meetingLink, '_blank')}
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </>
      )}
    </motion.div>
  );
};

export default CalendarEventCard;
