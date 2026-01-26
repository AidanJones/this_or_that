import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { SurveyCard } from './survey-card';
import { Survey } from "@/app/types/survey";
import { useState } from "react";

interface PublicFeedProps {
  surveys: Survey[];
  onTakeSurvey: (id: string) => void;
  onViewResults: (id: string) => void;
  onAccessPrivateSurvey: (inviteCode: string) => void;
}

export function PublicFeed({ surveys, onTakeSurvey, onViewResults, onAccessPrivateSurvey }: PublicFeedProps) {
  const [inviteCode, setInviteCode] = useState("");

  // Filter to show only public surveys
  const publicSurveys = surveys
    .filter(s => s.visibility === 'public')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAccessPrivate = () => {
    if (inviteCode.trim()) {
      onAccessPrivateSurvey(inviteCode.trim().toUpperCase());
      setInviteCode("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Public Feed</h1>
          </div>
          <p className="text-gray-600">Discover and participate in public surveys</p>
        </div>

        {/* Private Survey Access */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAccessPrivate();
                    }
                  }}
                  placeholder="Enter invite code for private survey"
                  className="bg-white w-full px-3 py-2"
                  style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}
                />
              </div>
              <Button onClick={handleAccessPrivate} disabled={!inviteCode.trim()}>
                Access
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Public Surveys Grid */}
        {publicSurveys.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No public surveys yet</p>
              <p className="text-gray-400">Be the first to create a public survey!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicSurveys.map(survey => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {survey.surveyType === 'tournament' ? (
                        <Trophy className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      ) : (
                        <List className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                      <CardTitle className="flex-1">{survey.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                      {survey.isExpired && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {survey.surveyType === 'tournament' 
                      ? `${survey.tournamentItems?.length || 0} items competing`
                      : `${survey.questions.length} comparison${survey.questions.length !== 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Preview Images */}
                    {survey.surveyType === 'standard' && survey.questions.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        <img 
                          src={survey.questions[0].optionAImage} 
                          alt="Preview" 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <img 
                          src={survey.questions[0].optionBImage} 
                          alt="Preview" 
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {survey.surveyType === 'tournament' && survey.tournamentItems && survey.tournamentItems.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {survey.tournamentItems.slice(0, 4).map(item => (
                          <img 
                            key={item.id}
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{survey.responses} / {survey.maxVotes} responses</span>
                      <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {!survey.isExpired && (
                        <Button
                          onClick={() => onTakeSurvey(survey.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Participate
                        </Button>
                      )}
                      {survey.responses > 0 && (
                        <Button
                          onClick={() => onViewResults(survey.id)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Results
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}