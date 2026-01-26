import { motion } from "motion/react";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
  size?: 'small' | 'large';
}

export function StreakDisplay({ streak, size = 'small' }: StreakDisplayProps) {
  if (streak === 0) return null;

  const isSmall = size === 'small';
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-1 font-bold ${
        isSmall ? 'text-sm' : 'text-lg'
      }`}
      style={{
        backgroundColor: '#FF10F0',
        boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Flame className={`${isSmall ? 'h-3 w-3' : 'h-5 w-5'}`} fill="#FFED00" stroke="#000000" />
      <span>{streak} day{streak !== 1 ? 's' : ''}</span>
    </motion.div>
  );
}