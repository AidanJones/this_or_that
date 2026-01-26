import { Survey, TournamentMatchup, VoteStrength } from "@/app/types/survey";
import { getRoundName, getWinnerOfMatchup } from "@/app/utils/tournament";
import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface InteractiveTournamentBracketProps {
  survey: Survey;
  onVote: (matchupId: string, choice: 'A' | 'B', strength: VoteStrength) => void;
  onComplete: () => void;
}

export function InteractiveTournamentBracket({ survey, onVote, onComplete }: InteractiveTournamentBracketProps) {
  const [pendingVote, setPendingVote] = useState<{ matchupId: string; choice: 'A' | 'B'; itemName: string } | null>(null);
  
  const items = survey.tournamentItems || [];
  const matchups = survey.tournamentMatchups || [];
  const currentRound = survey.currentTournamentRound ?? 0;

  // Group matchups by round
  const matchupsByRound = useMemo(() => {
    const grouped = new Map<number, TournamentMatchup[]>();
    matchups.forEach(m => {
      if (!grouped.has(m.round)) {
        grouped.set(m.round, []);
      }
      grouped.get(m.round)!.push(m);
    });
    
    grouped.forEach(roundMatchups => {
      roundMatchups.sort((a, b) => a.position - b.position);
    });
    
    return grouped;
  }, [matchups]);

  const maxRound = Math.max(...matchups.map(m => m.round));
  const rounds = Array.from(matchupsByRound.keys()).sort((a, b) => b - a);

  const getItemName = (itemId: string | null): string => {
    if (!itemId) return "TBD";
    const item = items.find(i => i.id === itemId);
    return item?.name || "Unknown";
  };

  const getItemImage = (itemId: string | null): string | null => {
    if (!itemId) return null;
    const item = items.find(i => i.id === itemId);
    return item?.image || null;
  };

  const handleImageClick = (matchupId: string, choice: 'A' | 'B', itemId: string | null) => {
    if (!itemId) return;
    const itemName = getItemName(itemId);
    setPendingVote({ matchupId, choice, itemName });
  };

  const handleStrengthSelect = (strength: VoteStrength) => {
    if (!pendingVote) return;
    onVote(pendingVote.matchupId, pendingVote.choice, strength);
    setPendingVote(null);
    
    // Check if all matchups in current round have votes
    const currentRoundMatchups = matchups.filter(m => m.round === currentRound);
    const allVoted = currentRoundMatchups.every(m => (m.votesA + m.votesB) >= (survey.tournamentRoundVotesRequired || 5));
    if (allVoted) {
      onComplete();
    }
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-8 min-w-full justify-center">
          {rounds.map(round => {
            const roundMatchups = matchupsByRound.get(round) || [];
            const roundName = getRoundName(round, maxRound + 1);
            const isActiveRound = round === currentRound;
            
            return (
              <div key={round} className="flex flex-col items-center" style={{ minWidth: '220px' }}>
                {/* Round Header */}
                <div className="mb-4 text-center">
                  <div 
                    className="newsprint-condensed text-sm font-bold px-3 py-1 inline-block"
                    style={{ 
                      backgroundColor: isActiveRound ? '#FF10F0' : '#000000',
                      color: isActiveRound ? '#000000' : '#FFFFFF',
                      boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)',
                      transform: 'rotate(-1deg)'
                    }}
                  >
                    {roundName.toUpperCase()}
                  </div>
                </div>

                {/* Matchups */}
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {roundMatchups.map(matchup => {
                    const itemAName = getItemName(matchup.itemA);
                    const itemBName = getItemName(matchup.itemB);
                    const itemAImage = getItemImage(matchup.itemA);
                    const itemBImage = getItemImage(matchup.itemB);
                    const totalVotes = matchup.votesA + matchup.votesB;
                    const isBye = matchup.itemA === null || matchup.itemB === null;
                    const winner = getWinnerOfMatchup(matchup, items);
                    const canVote = isActiveRound && totalVotes === 0 && !isBye;
                    
                    return (
                      <div 
                        key={matchup.id} 
                        className="bg-white p-2"
                        style={{ 
                          boxShadow: isActiveRound ? '4px 4px 0px rgba(255, 16, 240, 0.3)' : '2px 2px 0px rgba(0, 0, 0, 0.2)',
                          width: '200px'
                        }}
                      >
                        {isBye ? (
                          <div className="text-center py-2">
                            <p className="font-bold text-sm">{itemAName || itemBName}</p>
                            <p className="text-xs text-gray-600">(BYE)</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* Item A - Clickable */}
                            <button
                              onClick={() => canVote && handleImageClick(matchup.id, 'A', matchup.itemA)}
                              disabled={!canVote}
                              className={`w-full flex items-center gap-2 p-1.5 transition-all ${
                                canVote ? 'hover:scale-105 cursor-pointer hover:shadow-md' : 'cursor-default'
                              }`}
                              style={{ 
                                backgroundColor: winner === matchup.itemA && totalVotes > 0 ? '#FFED00' : '#FFFFFF',
                                boxShadow: canVote ? '3px 2px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {itemAImage && (
                                <img 
                                  src={itemAImage} 
                                  alt={itemAName}
                                  className="w-12 h-12 object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-bold truncate">{itemAName}</p>
                                {totalVotes > 0 && (
                                  <p className="text-xs">{matchup.votesA} votes</p>
                                )}
                              </div>
                            </button>

                            {/* VS */}
                            <div className="text-center text-xs font-bold py-0.5">VS</div>

                            {/* Item B - Clickable */}
                            <button
                              onClick={() => canVote && handleImageClick(matchup.id, 'B', matchup.itemB)}
                              disabled={!canVote}
                              className={`w-full flex items-center gap-2 p-1.5 transition-all ${
                                canVote ? 'hover:scale-105 cursor-pointer hover:shadow-md' : 'cursor-default'
                              }`}
                              style={{ 
                                backgroundColor: winner === matchup.itemB && totalVotes > 0 ? '#FF10F0' : '#FFFFFF',
                                boxShadow: canVote ? '2px 3px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {itemBImage && (
                                <img 
                                  src={itemBImage} 
                                  alt={itemBName}
                                  className="w-12 h-12 object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs font-bold truncate">{itemBName}</p>
                                {totalVotes > 0 && (
                                  <p className="text-xs">{matchup.votesB} votes</p>
                                )}
                              </div>
                            </button>

                            {canVote && (
                              <div className="text-center pt-1">
                                <span className="text-xs font-bold" style={{ color: '#FF10F0' }}>
                                  CLICK TO VOTE!
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strength Selection Modal */}
      <AnimatePresence>
        {pendingVote && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white max-w-md w-full p-6"
              style={{ boxShadow: '10px 10px 0px rgba(0, 0, 0, 0.3)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">You chose:</h3>
                <button onClick={() => setPendingVote(null)} className="p-2 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div 
                className="inline-block px-6 py-3 mb-6 text-xl font-bold text-black w-full text-center"
                style={{ backgroundColor: pendingVote.choice === 'A' ? '#FFED00' : '#FF10F0' }}
              >
                {pendingVote.itemName}
              </div>

              <h3 className="text-center text-lg font-bold mb-4">
                How strong is your preference?
              </h3>

              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleStrengthSelect('by-a-hair')}
                    className="w-full h-16 text-base flex flex-col font-bold"
                    style={{ backgroundColor: '#FFED00', boxShadow: '4px 5px 0px rgba(0, 0, 0, 0.3)' }}
                  >
                    <span className="font-bold text-black">By a Hair</span>
                    <span className="text-xs text-black">Just slightly better</span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleStrengthSelect('comfortably')}
                    className="w-full h-16 text-base flex flex-col font-bold"
                    style={{ backgroundColor: '#FF10F0', boxShadow: '5px 4px 0px rgba(0, 0, 0, 0.3)' }}
                  >
                    <span className="font-bold text-black">Comfortably</span>
                    <span className="text-xs text-black">Clearly prefer this option</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleStrengthSelect('no-brainer')}
                    className="w-full h-16 text-base flex flex-col font-bold"
                    style={{ backgroundColor: '#FFED00', boxShadow: '6px 5px 0px rgba(0, 0, 0, 0.3)' }}
                  >
                    <span className="font-bold text-black">No Brainer</span>
                    <span className="text-xs text-black">Obvious choice, not even close</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}