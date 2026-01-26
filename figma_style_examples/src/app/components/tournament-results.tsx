import { useMemo } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Lock, Unlock, Trophy, Crown } from "lucide-react";
import { Survey, ParticipantResponse, TournamentMatchup } from "@/app/types/survey";
import { getRoundName, getWinnerOfMatchup } from "@/app/utils/tournament";

interface TournamentResultsProps {
  survey: Survey;
  participantResponses: ParticipantResponse[];
  onBack: () => void;
  onTogglePrivacy: (surveyId: string, showIndividual: boolean) => void;
}

export function TournamentResults({ survey, participantResponses, onBack, onTogglePrivacy }: TournamentResultsProps) {
  const items = survey.tournamentItems || [];
  const matchups = survey.tournamentMatchups || [];

  // Group matchups by round
  const matchupsByRound = useMemo(() => {
    const grouped = new Map<number, TournamentMatchup[]>();
    matchups.forEach(m => {
      if (!grouped.has(m.round)) {
        grouped.set(m.round, []);
      }
      grouped.get(m.round)!.push(m);
    });
    
    // Sort matchups within each round by position
    grouped.forEach(roundMatchups => {
      roundMatchups.sort((a, b) => a.position - b.position);
    });
    
    return grouped;
  }, [matchups]);

  const maxRound = Math.max(...matchups.map(m => m.round));
  const rounds = Array.from(matchupsByRound.keys()).sort((a, b) => b - a);

  // Find overall winner (from finals)
  const finalsMatchup = matchups.find(m => m.round === 0);
  const overallWinner = finalsMatchup ? getWinnerOfMatchup(finalsMatchup, items) : null;
  const winnerItem = overallWinner ? items.find(i => i.id === overallWinner) : null;

  const getItemName = (itemId: string | null): string => {
    if (!itemId) return "BYE";
    const item = items.find(i => i.id === itemId);
    return item?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>{survey.title}</CardTitle>
                  <CardDescription>
                    {survey.responses} / {survey.maxVotes} response{survey.responses !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              {survey.isExpired && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Closed
                </Badge>
              )}
            </div>
            
            {survey.isExpired && (
              <div className="flex items-center gap-3 pt-4 border-t mt-4">
                <div className="flex items-center gap-2 flex-1">
                  {survey.showIndividualVotes ? (
                    <Unlock className="h-4 w-4 text-purple-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" />
                  )}
                  <Label htmlFor="privacy-toggle" className="cursor-pointer">
                    Show individual participant responses
                  </Label>
                </div>
                <Switch
                  id="privacy-toggle"
                  checked={survey.showIndividualVotes}
                  onCheckedChange={(checked) => onTogglePrivacy(survey.id, checked)}
                />
              </div>
            )}
          </CardHeader>
        </Card>

        {survey.responses === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No responses yet. Share this tournament to collect votes!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {winnerItem && survey.responses > 0 && (
              <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournament Winner</h2>
                    <img 
                      src={winnerItem.image} 
                      alt={winnerItem.name}
                      className="w-48 h-48 object-cover rounded-lg mx-auto mb-4 border-4 border-yellow-400 shadow-lg"
                    />
                    <div className="text-4xl font-bold text-purple-600">{winnerItem.name}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Tournament Bracket</CardTitle>
                <CardDescription>Results by round</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {rounds.map(round => {
                    const roundMatchups = matchupsByRound.get(round) || [];
                    const roundName = getRoundName(round, maxRound + 1);
                    
                    return (
                      <div key={round}>
                        <h3 className="font-semibold text-lg mb-4 text-purple-900">{roundName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {roundMatchups.map(matchup => {
                            const itemAName = getItemName(matchup.itemA);
                            const itemBName = getItemName(matchup.itemB);
                            const totalVotes = matchup.votesA + matchup.votesB;
                            const percentageA = totalVotes > 0 ? (matchup.votesA / totalVotes) * 100 : 0;
                            const percentageB = totalVotes > 0 ? (matchup.votesB / totalVotes) * 100 : 0;
                            const isBye = matchup.itemA === null || matchup.itemB === null;
                            
                            return (
                              <Card key={matchup.id} className={isBye ? "bg-gray-50" : "bg-white"}>
                                <CardContent className="pt-6 space-y-3">
                                  {isBye ? (
                                    <div className="text-center py-4">
                                      <p className="font-semibold">{itemAName || itemBName}</p>
                                      <p className="text-sm text-gray-500">(Automatic Bye)</p>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className={`font-medium ${matchup.votesA > matchup.votesB && totalVotes > 0 ? 'text-purple-700 font-bold' : ''}`}>
                                            {itemAName}
                                            {matchup.votesA > matchup.votesB && totalVotes > 0 && " 🏆"}
                                          </span>
                                          <span className="text-sm text-gray-600">
                                            {matchup.votesA} ({percentageA.toFixed(0)}%)
                                          </span>
                                        </div>
                                        {totalVotes > 0 && (
                                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-purple-500 h-full transition-all duration-500"
                                              style={{ width: `${percentageA}%` }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="text-center text-gray-400 font-bold">VS</div>
                                      
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className={`font-medium ${matchup.votesB > matchup.votesA && totalVotes > 0 ? 'text-pink-700 font-bold' : ''}`}>
                                            {itemBName}
                                            {matchup.votesB > matchup.votesA && totalVotes > 0 && " 🏆"}
                                          </span>
                                          <span className="text-sm text-gray-600">
                                            {matchup.votesB} ({percentageB.toFixed(0)}%)
                                          </span>
                                        </div>
                                        {totalVotes > 0 && (
                                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-pink-500 h-full transition-all duration-500"
                                              style={{ width: `${percentageB}%` }}
                                            />
                                          </div>
                                        )}
                                      </div>

                                      {totalVotes > 0 && (
                                        <div className="pt-2 text-xs text-gray-500 border-t">
                                          <div className="flex justify-between">
                                            <span>By hair: {matchup.votesAByHair} / {matchup.votesBByHair}</span>
                                            <span>Comfortably: {matchup.votesAComfortably} / {matchup.votesBComfortably}</span>
                                            <span>No brainer: {matchup.votesANoBrainer} / {matchup.votesBNoBrainer}</span>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {survey.isExpired && !survey.showIndividualVotes && (
              <Card className="mt-6">
                <CardContent className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Individual responses are private. Toggle the switch above to make them public.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}