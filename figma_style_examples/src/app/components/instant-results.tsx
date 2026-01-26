import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Question } from "@/app/types/survey";

interface InstantResultsProps {
  question: Question;
  userChoice: 'A' | 'B';
  onClose: () => void;
}

export function InstantResults({ question, userChoice, onClose }: InstantResultsProps) {
  const totalVotes = question.votesA + question.votesB;
  const percentageA = totalVotes > 0 ? Math.round((question.votesA / totalVotes) * 100) : 0;
  const percentageB = totalVotes > 0 ? Math.round((question.votesB / totalVotes) * 100) : 0;
  
  const userVotedForWinner = 
    (userChoice === 'A' && question.votesA >= question.votesB) ||
    (userChoice === 'B' && question.votesB >= question.votesA);
  
  const isTie = question.votesA === question.votesB;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white max-w-2xl w-full p-6"
        style={{ boxShadow: '12px 10px 0px rgba(0, 0, 0, 0.3)', transform: 'rotate(-1deg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block p-4 mb-4"
            style={{ backgroundColor: '#FFED00', transform: 'rotate(3deg)', boxShadow: '6px 5px 0px rgba(0, 0, 0, 0.3)' }}
          >
            <Check className="h-12 w-12" />
          </motion.div>
          <h2 className="newsprint-text text-3xl font-bold mb-3">
            <span className="ransom-letter-xl">V</span>
            <span className="ransom-letter-lg">O</span>
            <span className="ransom-letter-md">T</span>
            <span className="ransom-letter-xl">E</span>
            {' '}
            <span className="ransom-letter-lg">R</span>
            <span className="ransom-letter-xl">E</span>
            <span className="ransom-letter-md">C</span>
            <span className="ransom-letter-lg">O</span>
            <span className="ransom-letter-xl">R</span>
            <span className="ransom-letter-md">D</span>
            <span className="ransom-letter-lg">E</span>
            <span className="ransom-letter-xl">D</span>
            <span className="ransom-letter-lg">!</span>
          </h2>
          {!isTie && (
            <div className="inline-block px-4 py-2 newsprint-condensed text-lg font-bold"
              style={{ 
                backgroundColor: userVotedForWinner ? '#FF10F0' : '#FFED00',
                boxShadow: '5px 4px 0px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(-2deg)'
              }}
            >
              {userVotedForWinner ? "YOU'RE IN THE MAJORITY! 🎉" : "YOU'RE IN THE MINORITY! 🦄"}
            </div>
          )}
          {isTie && (
            <div className="inline-block px-4 py-2 newsprint-condensed text-lg font-bold"
              style={{ 
                backgroundColor: '#FF10F0',
                boxShadow: '4px 5px 0px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(2deg)'
              }}
            >
              IT'S A TIE! 🤝
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4 mb-6">
          {/* Option A */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">{question.optionA}</span>
                {userChoice === 'A' && (
                  <span className="px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#FFED00' }}>
                    YOUR VOTE
                  </span>
                )}
              </div>
              <span className="font-bold text-xl">{percentageA}%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageA}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-8"
              style={{ 
                backgroundColor: userChoice === 'A' ? '#FFED00' : '#e5e5e5',
                boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
              }}
            />
            <p className="text-sm mt-1">{question.votesA.toLocaleString()} votes</p>
          </div>

          {/* Option B */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">{question.optionB}</span>
                {userChoice === 'B' && (
                  <span className="px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: '#FF10F0' }}>
                    YOUR VOTE
                  </span>
                )}
              </div>
              <span className="font-bold text-xl">{percentageB}%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentageB}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-8"
              style={{ 
                backgroundColor: userChoice === 'B' ? '#FF10F0' : '#e5e5e5',
                boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
              }}
            />
            <p className="text-sm mt-1">{question.votesB.toLocaleString()} votes</p>
          </div>
        </div>

        {/* Strength Breakdown */}
        <div className="pt-4 mb-4" style={{ boxShadow: '0px -2px 0px rgba(0, 0, 0, 0.1)' }}>
          <h3 className="font-bold mb-3">Strength of Feeling</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold mb-1">{question.optionA}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>By a hair:</span>
                  <span>{question.votesAByHair}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comfortably:</span>
                  <span>{question.votesAComfortably}</span>
                </div>
                <div className="flex justify-between">
                  <span>No brainer:</span>
                  <span>{question.votesANoBrainer}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-bold mb-1">{question.optionB}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>By a hair:</span>
                  <span>{question.votesBByHair}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comfortably:</span>
                  <span>{question.votesBComfortably}</span>
                </div>
                <div className="flex justify-between">
                  <span>No brainer:</span>
                  <span>{question.votesBNoBrainer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 font-bold"
          style={{ backgroundColor: '#FF10F0', boxShadow: '5px 6px 0px rgba(0, 0, 0, 0.3)' }}
        >
          Continue to Next Survey →
        </button>
      </motion.div>
    </motion.div>
  );
}