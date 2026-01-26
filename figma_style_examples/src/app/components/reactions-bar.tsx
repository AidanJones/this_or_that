import { useState, useEffect } from "react";
import { ReactionType } from "@/app/types/survey";
import { addReaction, getReactionCounts, getUserReactionForSurvey } from "@/app/utils/engagement";
import { motion } from "motion/react";

interface ReactionsBarProps {
  surveyId: string;
}

const reactionEmojis: Record<ReactionType, string> = {
  fire: '🔥',
  laugh: '😂',
  think: '🤔',
  eyes: '👀',
  hundred: '💯'
};

const reactionLabels: Record<ReactionType, string> = {
  fire: 'Fire',
  laugh: 'Funny',
  think: 'Tough',
  eyes: 'Watching',
  hundred: 'Perfect'
};

export function ReactionsBar({ surveyId }: ReactionsBarProps) {
  const [counts, setCounts] = useState<Record<ReactionType, number>>({
    fire: 0,
    laugh: 0,
    think: 0,
    eyes: 0,
    hundred: 0
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

  useEffect(() => {
    loadReactions();
  }, [surveyId]);

  const loadReactions = () => {
    setCounts(getReactionCounts(surveyId));
    setUserReaction(getUserReactionForSurvey(surveyId));
  };

  const handleReaction = (type: ReactionType) => {
    addReaction(surveyId, type);
    loadReactions();
  };

  const totalReactions = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="border-2 border-black bg-white p-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(reactionEmojis) as ReactionType[]).map((type) => {
          const count = counts[type];
          const isActive = userReaction === type;
          
          return (
            <motion.button
              key={type}
              onClick={() => handleReaction(type)}
              className="px-3 py-2 border-2 border-black font-bold flex items-center gap-1 hover:scale-105 transition-transform"
              style={{
                backgroundColor: isActive ? '#FFED00' : '#FFFFFF',
                boxShadow: isActive ? '3px 3px 0px rgba(0, 0, 0, 0.3)' : '2px 2px 0px rgba(0, 0, 0, 0.2)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{reactionEmojis[type]}</span>
              {count > 0 && <span className="text-sm">{count}</span>}
            </motion.button>
          );
        })}
      </div>
      {totalReactions > 0 && (
        <p className="text-xs text-gray-600 mt-2">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </p>
      )}
    </div>
  );
}
