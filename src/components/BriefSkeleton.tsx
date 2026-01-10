import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const BriefSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0a0b0c] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="overflow-hidden">
          {/* Header Skeleton */}
          <div className="px-8 py-6 border-b border-[#1a1a1a] flex items-center justify-between">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>

          {/* Content Skeleton */}
          <div className="px-8 py-8 space-y-6">
            {/* Date Skeleton */}
            <Skeleton className="h-8 w-64" />

            {/* Greeting Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Items Skeleton */}
            <div className="space-y-3 max-h-[55vh] overflow-hidden">
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-[#111111] border border-[#1a1a1a] space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox skeleton */}
                    <Skeleton className="h-4 w-4 rounded-sm mt-0.5 flex-shrink-0" />
                    
                    <div className="flex-1 space-y-2">
                      {/* Title skeleton */}
                      <Skeleton className="h-4 w-3/4" />
                      {/* Subtitle skeleton */}
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>

                    {/* Badge skeleton */}
                    <Skeleton className="h-6 w-16 rounded-md flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default BriefSkeleton;
