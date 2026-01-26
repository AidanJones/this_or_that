import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { Survey, ParticipantResponse, VoteStrength } from "@/app/types/survey";

interface SurveyResultsProps {
  survey: Survey;
  participantResponses: ParticipantResponse[];
  onBack: () => void;
  onTogglePrivacy: (surveyId: string, showIndividual: boolean) => void;
}

const getStrengthLabel = (strength: VoteStrength) => {
  switch (strength) {
    case 'by-a-hair':
      return 'By a Hair';
    case 'comfortably':
      return 'Comfortably';
    case 'no-brainer':
      return 'No Brainer';
  }
};

const getStrengthColor = (strength: VoteStrength) => {
  switch (strength) {
    case 'by-a-hair':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'comfortably':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'no-brainer':
      return 'bg-purple-100 text-purple-800 border-purple-200';
  }
};

export function SurveyResults({ survey, participantResponses, onBack, onTogglePrivacy }: SurveyResultsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{survey.title}</CardTitle>
                <CardDescription>
                  {survey.responses} / {survey.maxVotes} response{survey.responses !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              {survey.isExpired && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Expired
                </Badge>
              )}
            </div>
            
            {survey.isExpired && (
              <div className="flex items-center gap-3 pt-4 border-t mt-4">
                <div className="flex items-center gap-2 flex-1">
                  {survey.showIndividualVotes ? (
                    <Unlock className="h-4 w-4 text-blue-600" />
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
          <CardContent className="space-y-6">
            {survey.responses === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No responses yet. Share this survey to collect data!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Aggregate Results</h3>
                  {survey.questions.map((question, index) => {
                    const totalVotes = question.votesA + question.votesB;
                    const percentageA = totalVotes > 0 ? (question.votesA / totalVotes) * 100 : 0;
                    const percentageB = totalVotes > 0 ? (question.votesB / totalVotes) * 100 : 0;

                    return (
                      <Card key={question.id} className="bg-gray-50">
                        <CardHeader>
                          <CardTitle className="text-base">
                            Comparison {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <img 
                                src={question.optionAImage} 
                                alt={question.optionA}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{question.optionA}</span>
                                  <span className="text-sm text-gray-600">
                                    {question.votesA} vote{question.votesA !== 1 ? 's' : ''} ({percentageA.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                  <div
                                    className="bg-blue-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentageA}%` }}
                                  />
                                </div>
                                {question.votesA > 0 && (
                                  <div className="flex gap-2 text-xs mt-1">
                                    <span className="text-yellow-700">By a hair: {question.votesAByHair}</span>
                                    <span className="text-green-700">Comfortably: {question.votesAComfortably}</span>
                                    <span className="text-purple-700">No brainer: {question.votesANoBrainer}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <img 
                                src={question.optionBImage} 
                                alt={question.optionB}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-200"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{question.optionB}</span>
                                  <span className="text-sm text-gray-600">
                                    {question.votesB} vote{question.votesB !== 1 ? 's' : ''} ({percentageB.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                  <div
                                    className="bg-indigo-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentageB}%` }}
                                  />
                                </div>
                                {question.votesB > 0 && (
                                  <div className="flex gap-2 text-xs mt-1">
                                    <span className="text-yellow-700">By a hair: {question.votesBByHair}</span>
                                    <span className="text-green-700">Comfortably: {question.votesBComfortably}</span>
                                    <span className="text-purple-700">No brainer: {question.votesBNoBrainer}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {question.votesA > question.votesB ? (
                            <div className="text-sm text-center text-green-700 font-semibold pt-2">
                              🏆 {question.optionA} is winning
                            </div>
                          ) : question.votesB > question.votesA ? (
                            <div className="text-sm text-center text-green-700 font-semibold pt-2">
                              🏆 {question.optionB} is winning
                            </div>
                          ) : totalVotes > 0 ? (
                            <div className="text-sm text-center text-gray-600 font-semibold pt-2">
                              🤝 It's a tie!
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {survey.isExpired && survey.showIndividualVotes && participantResponses.length > 0 && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="font-semibold text-lg">Individual Participant Responses</h3>
                    {participantResponses.map((participant, pIndex) => (
                      <Card key={participant.id} className="bg-white">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Participant {pIndex + 1}
                            </CardTitle>
                            <span className="text-sm text-gray-500">
                              {new Date(participant.timestamp).toLocaleDateString()} at{' '}
                              {new Date(participant.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {participant.responses.map((response, rIndex) => {
                              const question = survey.questions.find(q => q.id === response.questionId);
                              if (!question) return null;

                              return (
                                <div key={response.questionId} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0">
                                  <span className="text-sm text-gray-600">Comparison {rIndex + 1}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={response.choice === 'A' ? 'default' : 'secondary'}>
                                      {response.choice === 'A' ? question.optionA : question.optionB}
                                    </Badge>
                                    <Badge variant="outline" className={getStrengthColor(response.strength)}>
                                      {getStrengthLabel(response.strength)}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {survey.isExpired && !survey.showIndividualVotes && (
                  <div className="text-center py-8 border-t">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Individual responses are private. Toggle the switch above to make them public.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}