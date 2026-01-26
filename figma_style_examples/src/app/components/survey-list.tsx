import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { PlusCircle, BarChart3, PlayCircle, Trophy, List, Globe, Lock, Copy } from "lucide-react";
import { Survey } from "@/app/types/survey";
import { useState } from "react";

interface SurveyListProps {
  surveys: Survey[];
  onCreateNew: () => void;
  onCreateTournament: () => void;
  onTakeSurvey: (id: string) => void;
  onViewResults: (id: string) => void;
}

export function SurveyList({ surveys, onCreateNew, onCreateTournament, onTakeSurvey, onViewResults }: SurveyListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyInviteCode = (survey: Survey) => {
    if (survey.inviteCode) {
      navigator.clipboard.writeText(survey.inviteCode);
      setCopiedId(survey.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-5xl newsprint-text" style={{ 
                backgroundColor: '#FF10F0',
                boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(-2deg)',
                lineHeight: '0.9',
                display: 'inline-block'
              }}>
                <span className="ransom-letter-xl" style={{ color: '#000000' }}>M</span>
                <span className="ransom-letter-sm" style={{ color: '#000000' }}>Y</span>
              </span>
              <span className="px-2 py-1 text-5xl newsprint-condensed" style={{ 
                backgroundColor: '#FFED00',
                boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
                transform: 'rotate(1deg)',
                lineHeight: '0.9',
                display: 'inline-block'
              }}>
                <span className="ransom-letter-lg" style={{ color: '#000000' }}>S</span>
                <span className="ransom-letter-xl" style={{ color: '#000000' }}>U</span>
                <span className="ransom-letter-md" style={{ color: '#000000' }}>R</span>
                <span className="ransom-letter-lg" style={{ color: '#000000' }}>V</span>
                <span className="ransom-letter-xl" style={{ color: '#000000' }}>E</span>
                <span className="ransom-letter-md" style={{ color: '#000000' }}>Y</span>
                <span className="ransom-letter-lg" style={{ color: '#000000' }}>S</span>
              </span>
            </div>
            <p className="text-black text-lg ml-1">Manage your created surveys and tournaments</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={onCreateNew} 
              size="sm" 
              className="flex-1 sm:flex-none font-bold"
              style={{ backgroundColor: '#FFED00', color: '#000000' }}
            >
              <List className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Survey</span>
            </Button>
            <Button 
              onClick={onCreateTournament} 
              size="sm" 
              className="flex-1 sm:flex-none font-bold"
              style={{ backgroundColor: '#FF10F0', color: '#000000' }}
            >
              <Trophy className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Tournament</span>
            </Button>
          </div>
        </div>

        {surveys.length === 0 ? (
          <Card style={{ boxShadow: '5px 6px 0px rgba(0, 0, 0, 0.3)' }}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 mb-4" style={{ backgroundColor: '#FFED00' }}>
                <PlusCircle className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No surveys yet</h3>
              <p className="text-black mb-6 text-center max-w-md">
                Get started by creating your first binary comparison survey
              </p>
              <Button 
                onClick={onCreateNew}
                className="font-bold"
                style={{ backgroundColor: '#FFED00', color: '#000000' }}
              >
                Create Your First Survey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow" style={{ boxShadow: '5px 6px 0px rgba(0, 0, 0, 0.3)' }}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {survey.surveyType === 'tournament' ? (
                        <Trophy className="h-4 w-4 flex-shrink-0" style={{ color: '#FF10F0' }} />
                      ) : (
                        <List className="h-4 w-4 flex-shrink-0" style={{ color: '#FFED00' }} />
                      )}
                      <CardTitle className="flex-1 text-black">{survey.title}</CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {survey.visibility === 'public' ? (
                        <Badge variant="outline" className="bg-white text-black" style={{ boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-white" style={{ backgroundColor: '#FF10F0', boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {survey.isExpired && (
                        <Badge variant="secondary" className="bg-black text-white" style={{ boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}>
                          Closed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-black">
                    {survey.surveyType === 'tournament' 
                      ? `${survey.tournamentItems?.length || 0} items competing`
                      : `${survey.questions.length} comparison${survey.questions.length !== 1 ? 's' : ''}`
                    }
                  </CardDescription>
                  {survey.visibility === 'private' && survey.inviteCode && (
                    <div className="mt-2 p-2 text-center" style={{ backgroundColor: '#FF10F0', boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}>
                      <span className="text-xs text-black font-mono font-bold">{survey.inviteCode}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => onTakeSurvey(survey.id)} 
                      className="w-full font-bold"
                      disabled={survey.isExpired}
                      style={{ backgroundColor: survey.isExpired ? '#cccccc' : '#FFED00', color: '#000000' }}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {survey.isExpired ? 'Survey Closed' : 'Take Survey'}
                    </Button>
                    <Button 
                      onClick={() => onViewResults(survey.id)} 
                      className="w-full font-bold"
                      style={{ backgroundColor: '#FF10F0', color: '#000000' }}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                    {survey.inviteCode && (
                      <Button
                        onClick={() => handleCopyInviteCode(survey)}
                        className="w-full font-bold bg-white text-black"
                        style={{ boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.3)' }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copiedId === survey.id ? 'Copied!' : 'Copy Code'}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-black mt-3 text-center">
                    {survey.responses} / {survey.maxVotes} response{survey.responses !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}