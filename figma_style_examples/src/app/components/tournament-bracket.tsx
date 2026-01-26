import { Survey, TournamentMatchup, TournamentItem, VoteStrength } from "@/app/types/survey";
import { getRoundName, getWinnerOfMatchup } from "@/app/utils/tournament";
import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { motion } from "motion/react";

interface TournamentBracketProps {
  survey: Survey;
  highlightActiveRound?: boolean;
  enableVoting?: boolean;
  onVote?: (matchupId: string, choice: 'A' | 'B', strength: VoteStrength) => void;
}

export function TournamentBracket({ survey, highlightActiveRound = false, enableVoting = false, onVote }: TournamentBracketProps) {
  const [pendingVote, setPendingVote] = useState<{ matchupId: string; choice: 'A' | 'B' } | null>(null);
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

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex gap-8 min-w-full justify-center">
        {rounds.map(round => {
          const roundMatchups = matchupsByRound.get(round) || [];
          const roundName = getRoundName(round, maxRound + 1);
          const isActiveRound = highlightActiveRound && round === currentRound;
          
          return (
            <div key={round} className="flex flex-col items-center" style={{ minWidth: '200px' }}>
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
              <div className="space-y-12 flex-1 flex flex-col justify-center">
                {roundMatchups.map(matchup => {
                  const itemAName = getItemName(matchup.itemA);
                  const itemBName = getItemName(matchup.itemB);
                  const itemAImage = getItemImage(matchup.itemA);
                  const itemBImage = getItemImage(matchup.itemB);
                  const totalVotes = matchup.votesA + matchup.votesB;
                  const isBye = matchup.itemA === null || matchup.itemB === null;
                  const winner = getWinnerOfMatchup(matchup, items);
                  
                  return (
                    <div 
                      key={matchup.id} 
                      className="border-2 border-black bg-white p-2"
                      style={{ 
                        boxShadow: isActiveRound ? '3px 3px 0px rgba(255, 16, 240, 0.5)' : '2px 2px 0px rgba(0, 0, 0, 0.2)',
                        width: '180px'
                      }}
                    >
                      {isBye ? (
                        <div className="text-center py-2">
                          <p className="font-bold text-sm">{itemAName || itemBName}</p>
                          <p className="text-xs text-gray-600">(BYE)</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Item A */}
                          <div 
                            className="flex items-center gap-2 p-1 border border-black"
                            style={{ 
                              backgroundColor: winner === matchup.itemA && totalVotes > 0 ? '#FFED00' : '#FFFFFF'
                            }}
                          >
                            {itemAImage && (
                              <img 
                                src={itemAImage} 
                                alt={itemAName}
                                className="w-8 h-8 object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{itemAName}</p>
                              {totalVotes > 0 && (
                                <p className="text-xs">{matchup.votesA} votes</p>
                              )}
                            </div>
                          </div>

                          {/* VS */}
                          <div className="text-center text-xs font-bold">VS</div>

                          {/* Item B */}
                          <div 
                            className="flex items-center gap-2 p-1 border border-black"
                            style={{ 
                              backgroundColor: winner === matchup.itemB && totalVotes > 0 ? '#FF10F0' : '#FFFFFF'
                            }}
                          >
                            {itemBImage && (
                              <img 
                                src={itemBImage} 
                                alt={itemBName}
                                className="w-8 h-8 object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{itemBName}</p>
                              {totalVotes > 0 && (
                                <p className="text-xs">{matchup.votesB} votes</p>
                              )}
                            </div>
                          </div>

                          {isActiveRound && totalVotes === 0 && enableVoting && (
                            <div className="text-center pt-1">
                              <motion.div
                                className="inline-block"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Button
                                  size="sm"
                                  className="bg-pink-500 text-white font-bold"
                                  onClick={() => setPendingVote({ matchupId: matchup.id, choice: 'A' })}
                                >
                                  Vote for {itemAName}
                                </Button>
                              </motion.div>
                              <motion.div
                                className="inline-block"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                              >
                                <Button
                                  size="sm"
                                  className="bg-pink-500 text-white font-bold"
                                  onClick={() => setPendingVote({ matchupId: matchup.id, choice: 'B' })}
                                >
                                  Vote for {itemBName}
                                </Button>
                              </motion.div>
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
  );
}