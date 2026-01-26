import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Trophy, List, BarChart3, Globe, Lock, Search, Clock, Users, Check } from "lucide-react";
import { Survey, SurveyResponse, VoteStrength } from "@/app/types/survey";
import { useState } from "react";
import { getAccessedPrivateSurveys, getCurrentUserId } from "@/app/utils/user";
import { ShareMenu } from "@/app/components/share-menu";

interface MainFeedProps {
  surveys: Survey[];
  onTakeSurvey: (id: string) => void;
  onViewResults: (id: string) => void;
  onAccessPrivateSurvey: (inviteCode: string) => void;
  onCompleteSurvey?: (surveyId: string, responses: SurveyResponse[]) => void;
}

export function MainFeed({ surveys, onTakeSurvey, onViewResults, onAccessPrivateSurvey, onCompleteSurvey }: MainFeedProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [votingState, setVotingState] = useState<{ [surveyId: string]: { choice: 'A' | 'B' | null } }>({});
  const [votedSurveys, setVotedSurveys] = useState<Set<string>>(new Set());

  const currentUserId = getCurrentUserId();
  const accessedPrivateSurveys = getAccessedPrivateSurveys();

  // Filter surveys to show in feed
  const feedSurveys = surveys
    .filter(s => {
      if (s.visibility === 'public') return true;
      if (s.creatorId === currentUserId) return true;
      if (s.visibility === 'private' && accessedPrivateSurveys.includes(s.id)) return true;
      return false;
    })
    .filter(s => {
      if (filter === 'active' && s.isExpired) return false;
      if (filter === 'closed' && !s.isExpired) return false;
      return true;
    })
    .filter(s => {
      if (searchQuery.trim()) {
        return s.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isExpired !== b.isExpired) {
        return a.isExpired ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleAccessPrivate = () => {
    if (inviteCode.trim()) {
      onAccessPrivateSurvey(inviteCode.trim().toUpperCase());
      setInviteCode("");
    }
  };

  const handleImageClick = (surveyId: string, choice: 'A' | 'B') => {
    if (votedSurveys.has(surveyId)) return;
    // Allow switching choice before strength is selected
    setVotingState(prev => ({
      ...prev,
      [surveyId]: { choice }
    }));
  };

  const handleStrengthSelect = (surveyId: string, strength: VoteStrength) => {
    const survey = surveys.find(s => s.id === surveyId);
    const state = votingState[surveyId];
    
    if (!survey || !state || !state.choice || !onCompleteSurvey) return;

    const response: SurveyResponse = {
      questionId: survey.questions[0].id,
      choice: state.choice,
      strength
    };

    onCompleteSurvey(surveyId, [response]);
    setVotedSurveys(prev => new Set([...prev, surveyId]));
    setVotingState(prev => {
      const newState = { ...prev };
      delete newState[surveyId];
      return newState;
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
            <Input
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-black"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              size="sm"
              className={filter === 'all' ? 'bg-black text-white' : 'border-2 border-black bg-white text-black'}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('active')}
              size="sm"
              className={filter === 'active' ? 'bg-black text-white' : 'border-2 border-black bg-white text-black'}
            >
              Active
            </Button>
            <Button
              onClick={() => setFilter('closed')}
              size="sm"
              className={filter === 'closed' ? 'bg-black text-white' : 'border-2 border-black bg-white text-black'}
            >
              Closed
            </Button>
          </div>
        </div>

        {/* Feed */}
        {feedSurveys.length === 0 ? (
          <Card className="border-2 border-black">
            <CardContent className="py-16 text-center">
              <div className="p-4 inline-flex mb-4" style={{ backgroundColor: '#FFED00' }}>
                <Search className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No surveys found</h3>
              <p className="text-black">
                {searchQuery ? 'Try a different search term' : 'Check back later for new surveys'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedSurveys.map(survey => {
              const hasVoted = votedSurveys.has(survey.id);
              const votingForThis = votingState[survey.id];
              
              return (
                <Card key={survey.id} className="overflow-hidden border-2 border-black hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {survey.surveyType === 'tournament' ? (
                            <span className="ransom-box-pink px-2 py-1 text-xs">
                              <Trophy className="h-3 w-3 inline mr-1" />
                              TOURNAMENT
                            </span>
                          ) : (
                            <span className="ransom-box-yellow px-2 py-1 text-xs">
                              <List className="h-3 w-3 inline mr-1" />
                              SURVEY
                            </span>
                          )}
                          {survey.visibility === 'public' ? (
                            <span className="ransom-box-white px-2 py-1 text-xs">
                              <Globe className="h-3 w-3 inline mr-1" />
                              PUBLIC
                            </span>
                          ) : (
                            <span className="ransom-box-black px-2 py-1 text-xs text-pink-500">
                              <Lock className="h-3 w-3 inline mr-1" />
                              PRIVATE
                            </span>
                          )}
                          {survey.creatorId === currentUserId && (
                            <span className="ransom-box-yellow px-2 py-1 text-xs">
                              YOUR SURVEY
                            </span>
                          )}
                          {survey.isExpired && (
                            <span className="ransom-box-black px-2 py-1 text-xs text-white">
                              CLOSED
                            </span>
                          )}
                          {hasVoted && (
                            <span className="px-2 py-1 text-xs border-2 border-black bg-white text-black flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              VOTED
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-1 text-black">{survey.title}</CardTitle>
                        <CardDescription className="flex items-center gap-3 text-sm text-black">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(survey.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {survey.responses} response{survey.responses !== 1 ? 's' : ''}
                          </span>
                        </CardDescription>
                      </div>
                      <ShareMenu survey={survey} />
                    </div>
                  </CardHeader>

                  {/* Survey Images - Clickable for voting */}
                  <div className="px-6">
                    {survey.surveyType === 'standard' && survey.questions.length > 0 && !survey.isExpired && !hasVoted && (
                      <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleImageClick(survey.id, 'A')}
                            className="relative group cursor-pointer hover:shadow-lg transition-all"
                            style={{ 
                              backgroundColor: votingForThis?.choice === 'A' ? '#FFED00' : 'transparent',
                              boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
                              transform: 'rotate(-2deg)'
                            }}
                          >
                            <img 
                              src={survey.questions[0].optionAImage} 
                              alt={survey.questions[0].optionA}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                              <span className="text-white font-semibold text-sm">{survey.questions[0].optionA}</span>
                            </div>
                            {votingForThis?.choice === 'A' && (
                              <div className="absolute top-2 right-2 p-2 rounded-full" style={{ backgroundColor: '#FFED00' }}>
                                <Check className="h-4 w-4 text-black" />
                              </div>
                            )}
                          </button>

                          <button
                            onClick={() => handleImageClick(survey.id, 'B')}
                            className="relative group cursor-pointer hover:shadow-lg transition-all"
                            style={{ 
                              backgroundColor: votingForThis?.choice === 'B' ? '#FF10F0' : 'transparent',
                              boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
                              transform: 'rotate(2deg)'
                            }}
                          >
                            <img 
                              src={survey.questions[0].optionBImage} 
                              alt={survey.questions[0].optionB}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                              <span className="text-white font-semibold text-sm">{survey.questions[0].optionB}</span>
                            </div>
                            {votingForThis?.choice === 'B' && (
                              <div className="absolute top-2 right-2 p-2 rounded-full" style={{ backgroundColor: '#FF10F0' }}>
                                <Check className="h-4 w-4 text-black" />
                              </div>
                            )}
                          </button>
                        </div>

                        {/* Strength Selection */}
                        {votingForThis && (
                          <div className="space-y-2 p-4 border-2 border-black" style={{ backgroundColor: votingForThis.choice === 'A' ? '#FFED00' : '#FF10F0' }}>
                            <h4 className="text-sm font-bold text-black text-center">How strong is your preference?</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'by-a-hair')}
                                className="text-xs bg-white text-black border-2 border-black font-bold"
                                size="sm"
                              >
                                By a Hair
                              </Button>
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'comfortably')}
                                className="text-xs bg-white text-black border-2 border-black font-bold"
                                size="sm"
                              >
                                Comfortably
                              </Button>
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'no-brainer')}
                                className="text-xs bg-white text-black border-2 border-black font-bold"
                                size="sm"
                              >
                                No Brainer
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tournament or Closed Survey - Show preview only */}
                    {(survey.surveyType === 'tournament' || survey.isExpired || hasVoted) && survey.surveyType === 'standard' && survey.questions.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="relative">
                          <img 
                            src={survey.questions[0].optionAImage} 
                            alt={survey.questions[0].optionA}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-3">
                            <span className="text-white font-semibold text-sm">{survey.questions[0].optionA}</span>
                          </div>
                        </div>
                        <div className="relative">
                          <img 
                            src={survey.questions[0].optionBImage} 
                            alt={survey.questions[0].optionB}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-3">
                            <span className="text-white font-semibold text-sm">{survey.questions[0].optionB}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tournament items preview */}
                    {survey.surveyType === 'tournament' && survey.tournamentItems && survey.tournamentItems.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-4 gap-2">
                          {survey.tournamentItems.slice(0, 8).map((item, idx) => (
                            <div key={item.id} className="relative">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              {idx === 7 && survey.tournamentItems && survey.tournamentItems.length > 8 && (
                                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    +{survey.tournamentItems.length - 8}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <CardContent className="pt-3">
                    <div className="flex gap-3">
                      {survey.surveyType === 'tournament' && !survey.isExpired && (
                        <Button
                          onClick={() => onTakeSurvey(survey.id)}
                          className="flex-1 text-black hover:opacity-90 font-bold shadow-md"
                          style={{ backgroundColor: '#FF10F0' }}
                          size="lg"
                        >
                          <Trophy className="mr-2 h-5 w-5" />
                          Enter Tournament
                        </Button>
                      )}
                      {survey.responses > 0 && (
                        <Button
                          onClick={() => onViewResults(survey.id)}
                          className="flex-1 text-black hover:opacity-90 font-bold shadow-md"
                          style={{ backgroundColor: '#FFED00' }}
                          size="lg"
                        >
                          <BarChart3 className="mr-2 h-5 w-5" />
                          Results
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}