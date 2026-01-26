import { useState, useMemo } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ArrowLeft, AlertCircle, Trophy } from "lucide-react";
import { Survey, TournamentResponse, VoteStrength } from "@/app/types/survey";
import { motion } from "motion/react";
import { InteractiveTournamentBracket } from "@/app/components/interactive-tournament-bracket";

interface TournamentTakerProps {
  survey: Survey;
  onBack: () => void;
  onComplete: (surveyId: string, responses: TournamentResponse[]) => void;
}

export function TournamentTaker({ survey, onBack, onComplete }: TournamentTakerProps) {
  const [responses, setResponses] = useState<TournamentResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const matchups = survey.tournamentMatchups || [];
  const currentRound = survey.currentTournamentRound ?? 0;
  const requiredVotes = survey.tournamentRoundVotesRequired ?? 5;

  // Calculate progress for current round
  const currentRoundProgress = useMemo(() => {
    const currentRoundMatchups = matchups.filter(m => m.round === currentRound);
    if (currentRoundMatchups.length === 0) return 0;
    const minVotes = Math.min(...currentRoundMatchups.map(m => m.votesA + m.votesB));
    return Math.min((minVotes / requiredVotes) * 100, 100);
  }, [matchups, currentRound, requiredVotes]);

  const handleVote = (matchupId: string, choice: 'A' | 'B', strength: VoteStrength) => {
    const newResponse: TournamentResponse = {
      matchupId,
      choice,
      strength
    };
    setResponses([...responses, newResponse]);
  };

  const handleComplete = () => {
    setIsComplete(true);
    onComplete(survey.id, responses);
  };

  if (survey.isExpired) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <Card className="max-w-md" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)' }}>
          <CardContent className="pt-16 pb-16 text-center">
            <div className="p-6 inline-flex mb-6" style={{ backgroundColor: '#FFED00', boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)' }}>
              <AlertCircle className="h-16 w-16 text-black" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Tournament Closed</h2>
            <p className="text-black mb-8">
              This tournament has reached its maximum number of responses ({survey.maxVotes})
            </p>
            <Button onClick={onBack} size="lg" className="bg-black text-white" style={{ boxShadow: '4px 5px 0px rgba(0, 0, 0, 0.3)' }}>
              Back to Surveys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (matchups.length === 0) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <Card className="max-w-md" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)' }}>
          <CardContent className="pt-16 pb-16 text-center">
            <p className="text-black">No matchups available in this tournament.</p>
            <Button onClick={onBack} className="mt-4 bg-black text-white" style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)' }}>Back to Surveys</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md" style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.3)' }}>
            <CardContent className="pt-16 pb-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="p-6 inline-flex mb-6"
                style={{ backgroundColor: '#FF10F0', boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.3)' }}
              >
                <Trophy className="h-16 w-16 text-black" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">Votes Recorded!</h2>
              <p className="text-black mb-8">
                Thanks for participating in this round
              </p>
              <Button onClick={onBack} size="lg" className="bg-black text-white" style={{ boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.3)' }}>
                Back to Feed
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6" style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        {/* Tournament Header */}
        <Card className="mb-6" style={{ boxShadow: '5px 6px 0px rgba(0, 0, 0, 0.3)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2" style={{ backgroundColor: '#FF10F0' }}>
                  <Trophy className="h-5 w-5 text-black" />
                </div>
                <CardTitle className="text-black">{survey.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3" style={{ backgroundColor: '#FFED00', boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.3)' }}>
              <p className="text-sm font-bold text-black text-center">
                Current Round Progress: {currentRoundProgress.toFixed(0)}% ({requiredVotes} votes needed per matchup)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Tournament Bracket */}
        <Card style={{ boxShadow: '6px 7px 0px rgba(0, 0, 0, 0.3)' }}>
          <CardHeader>
            <CardTitle className="text-black newsprint-text text-xl">
              <span className="ransom-letter-lg">C</span>
              <span className="ransom-letter-xl">L</span>
              <span className="ransom-letter-md">I</span>
              <span className="ransom-letter-lg">C</span>
              <span className="ransom-letter-xl">K</span>
              {' '}
              <span className="ransom-letter-md">O</span>
              <span className="ransom-letter-lg">N</span>
              {' '}
              <span className="ransom-letter-xl">I</span>
              <span className="ransom-letter-lg">M</span>
              <span className="ransom-letter-md">A</span>
              <span className="ransom-letter-xl">G</span>
              <span className="ransom-letter-lg">E</span>
              <span className="ransom-letter-md">S</span>
              {' '}
              <span className="ransom-letter-xl">T</span>
              <span className="ransom-letter-lg">O</span>
              {' '}
              <span className="ransom-letter-md">V</span>
              <span className="ransom-letter-xl">O</span>
              <span className="ransom-letter-lg">T</span>
              <span className="ransom-letter-xl">E</span>
              <span className="ransom-letter-md">!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InteractiveTournamentBracket 
              survey={survey}
              onVote={handleVote}
              onComplete={handleComplete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}