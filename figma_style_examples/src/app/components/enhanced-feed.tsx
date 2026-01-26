import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Trophy, BarChart3, Globe, Lock, Search, TrendingUp, Eye, MessageCircle, Share2 } from "lucide-react";
import { Survey, SurveyResponse, VoteStrength, SurveyCategory } from "@/app/types/survey";
import { useState } from "react";
import { getAccessedPrivateSurveys } from "@/app/utils/user";
import { getCurrentUserProfile, followUser, unfollowUser, isFollowing } from "@/app/utils/profile";
import { ShareMenu } from "@/app/components/share-menu";
import { CommentsSection } from "@/app/components/comments-section";
import { ReactionsBar } from "@/app/components/reactions-bar";
import { InstantResults } from "@/app/components/instant-results";
import { StreakDisplay } from "@/app/components/streak-display";
import { motion } from "motion/react";

interface EnhancedFeedProps {
  surveys: Survey[];
  onTakeSurvey: (id: string) => void;
  onViewResults: (id: string) => void;
  onCompleteSurvey?: (surveyId: string, responses: SurveyResponse[]) => void;
  onAccessPrivateSurvey?: (inviteCode: string) => void;
  onOpenProfile?: () => void;
}

export function EnhancedFeed({ surveys, onTakeSurvey, onViewResults, onCompleteSurvey, onAccessPrivateSurvey, onOpenProfile }: EnhancedFeedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SurveyCategory | 'all' | 'trending' | 'tournament'>('all');
  const [votingState, setVotingState] = useState<{ [surveyId: string]: { choice: 'A' | 'B' | null } }>({});
  const [votedSurveys, setVotedSurveys] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState<{ surveyId: string; choice: 'A' | 'B' } | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const currentUser = getCurrentUserProfile();
  const accessedPrivateSurveys = getAccessedPrivateSurveys();

  const categories: Array<{ value: SurveyCategory | 'all' | 'trending' | 'tournament'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'trending', label: 'Trending' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'food', label: 'Food' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'tech', label: 'Tech' },
  ];

  // Calculate trending score
  const getTrendingScore = (survey: Survey): number => {
    const ageInHours = (Date.now() - new Date(survey.createdAt).getTime()) / (1000 * 60 * 60);
    const recentVotes = survey.responses; // In real app, would track votes in last 24h
    const engagement = (survey.commentCount || 0) + (survey.reactionCount || 0);
    
    // Decay score based on age, boost based on engagement
    return (recentVotes * 10 + engagement * 5) / Math.max(1, ageInHours / 24);
  };

  // Filter and sort surveys based on selected category
  const feedSurveys = surveys
    .filter(s => {
      // Access control
      if (s.visibility === 'public') return true;
      if (s.creatorId === currentUser.id) return true;
      if (s.visibility === 'private' && accessedPrivateSurveys.includes(s.id)) return true;
      return false;
    })
    .filter(s => {
      // Tournament filter
      if (selectedCategory === 'tournament') {
        return s.surveyType === 'tournament';
      }
      // Category filter (skip if trending or all selected)
      if (selectedCategory !== 'all' && selectedCategory !== 'trending' && s.category !== selectedCategory) return false;
      return true;
    })
    .filter(s => {
      // Search filter
      if (searchQuery.trim()) {
        return s.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedCategory === 'trending') {
        return getTrendingScore(b) - getTrendingScore(a);
      }
      // Default: newest first, but prioritize non-expired
      if (a.isExpired !== b.isExpired) {
        return a.isExpired ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleImageClick = (surveyId: string, choice: 'A' | 'B') => {
    if (votedSurveys.has(surveyId)) return;
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
    
    // Show instant results
    setShowResults({ surveyId, choice: state.choice });
    
    setVotingState(prev => {
      const newState = { ...prev };
      delete newState[surveyId];
      return newState;
    });
  };

  const handleFollow = (userId: string) => {
    if (isFollowing(userId)) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
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
      {/* Fixed Search and Filter Bar - Bottom of screen, above nav */}
      <div className="fixed bottom-16 left-0 right-0 bg-white z-[90] pb-2" style={{ boxShadow: '0px -4px 0px rgba(0, 0, 0, 0.3)' }}>
        <div className="max-w-4xl mx-auto px-2">
          {/* Search Bar */}
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search surveys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}
              />
            </div>
          </div>

          {/* Category Pills and Invite Code */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat, idx) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold newsprint-condensed whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.value ? 'bg-[#FF10F0]' : 'bg-white hover:bg-gray-100'
                }`}
                style={selectedCategory === cat.value ? { 
                  boxShadow: `${3 + idx % 2}px ${4 - idx % 2}px 0px rgba(0, 0, 0, 0.3)`,
                  transform: `rotate(${idx % 2 === 0 ? '-1' : '1'}deg)`
                } : { boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}
              >
                #{cat.label.toUpperCase()}
              </button>
            ))}
            
            {/* Invite Code Input */}
            <div className="flex gap-1 items-center ml-auto flex-shrink-0">
              <input
                type="text"
                placeholder="Code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-8 text-sm w-24 px-2 focus:outline-none"
                style={{ boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}
                maxLength={10}
              />
              <Button
                onClick={() => {
                  if (inviteCode.trim() && onAccessPrivateSurvey) {
                    onAccessPrivateSurvey(inviteCode.trim());
                    setInviteCode('');
                  }
                }}
                disabled={!inviteCode.trim()}
                className="h-8 px-2 text-sm font-bold"
                style={{ backgroundColor: '#FF10F0', boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.3)' }}
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Add bottom padding for fixed search/nav bars */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-48">
        {/* Sign In / Sign Up Banner - Only show if no custom username */}
        {!currentUser.name && onOpenProfile && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <Card style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)', transform: 'rotate(-1deg)' }}>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="mb-3">
                    <span className="newsprint-text text-2xl font-bold">
                      <span className="ransom-letter-xl">C</span>
                      <span className="ransom-letter-lg">R</span>
                      <span className="ransom-letter-md">E</span>
                      <span className="ransom-letter-lg">A</span>
                      <span className="ransom-letter-xl">T</span>
                      <span className="ransom-letter-md">E</span>
                      {' '}
                      <span className="ransom-letter-lg">Y</span>
                      <span className="ransom-letter-xl">O</span>
                      <span className="ransom-letter-md">U</span>
                      <span className="ransom-letter-lg">R</span>
                      {' '}
                      <span className="ransom-letter-xl">P</span>
                      <span className="ransom-letter-lg">R</span>
                      <span className="ransom-letter-md">O</span>
                      <span className="ransom-letter-xl">F</span>
                      <span className="ransom-letter-lg">I</span>
                      <span className="ransom-letter-md">L</span>
                      <span className="ransom-letter-xl">E</span>
                    </span>
                  </div>
                  <p className="text-sm mb-4 text-gray-700">
                    Sign up to track your voting streak, save surveys, and join the community!
                  </p>
                  <Button
                    onClick={onOpenProfile}
                    className="font-bold px-6 py-3 text-lg"
                    style={{ backgroundColor: '#FF10F0', boxShadow: '5px 6px 0px rgba(0, 0, 0, 0.3)' }}
                  >
                    SIGN UP / SIGN IN
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Streak Banner */}
        {currentUser.votingStreak > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 p-4 text-center"
            style={{ backgroundColor: '#FFED00', boxShadow: '8px 8px 0px rgba(0, 0, 0, 0.3)', transform: 'rotate(-1deg)' }}
          >
            <div className="flex items-center justify-center gap-3">
              <StreakDisplay streak={currentUser.votingStreak} size="large" />
              <span className="newsprint-text text-2xl font-bold">
                <span className="ransom-letter-lg">V</span>
                <span className="ransom-letter-md">O</span>
                <span className="ransom-letter-xl">T</span>
                <span className="ransom-letter-sm">I</span>
                <span className="ransom-letter-lg">N</span>
                <span className="ransom-letter-md">G</span>
                {' '}
                <span className="ransom-letter-xl">S</span>
                <span className="ransom-letter-lg">T</span>
                <span className="ransom-letter-md">R</span>
                <span className="ransom-letter-lg">E</span>
                <span className="ransom-letter-xl">A</span>
                <span className="ransom-letter-sm">K</span>
                {' '}
                <span className="ransom-letter-lg">🔥</span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Survey Feed */}
        <div className="space-y-6">
          {feedSurveys.length === 0 ? (
            <Card>
              <CardContent className="pt-16 pb-16 text-center">
                <p className="text-black text-lg">No surveys found. Try adjusting your filters!</p>
              </CardContent>
            </Card>
          ) : (
            feedSurveys.map((survey) => {
              const isTournament = survey.surveyType === 'tournament';
              const question = survey.questions[0];
              
              // Skip if it's a standard survey without a question
              if (!isTournament && !question) return null;

              const votingChoice = votingState[survey.id]?.choice;
              const hasVoted = votedSurveys.has(survey.id);
              const following = isFollowing(survey.creatorId);

              return (
                <Card key={survey.id} className="overflow-hidden" style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)' }}>
                  {/* Survey Header */}
                  <div className="p-3 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">{survey.creatorName || 'Anonymous'}</span>
                          {survey.creatorId !== currentUser.id && (
                            <button
                              onClick={() => handleFollow(survey.creatorId)}
                              className="px-2 py-0.5 text-xs font-bold"
                              style={{ backgroundColor: following ? '#e5e5e5' : '#FFED00' }}
                            >
                              {following ? 'Following' : 'Follow'}
                            </button>
                          )}
                          <span className="text-xs text-gray-500">{getTimeAgo(survey.createdAt)}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{survey.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {survey.category && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-white">
                              #{survey.category}
                            </span>
                          )}
                          {isTournament && (
                            <span className="px-2 py-0.5 text-xs font-bold flex items-center gap-1" style={{ backgroundColor: '#FF10F0' }}>
                              <Trophy className="h-3 w-3" />
                              Tournament
                            </span>
                          )}
                          {survey.visibility === 'private' && (
                            <span className="px-2 py-0.5 text-xs font-bold flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                      <ShareMenu surveyId={survey.id} surveyTitle={survey.title} inviteCode={survey.inviteCode} />
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="px-3 py-1.5 bg-gray-50 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{(survey.views || survey.responses * 2 || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{survey.responses.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{survey.commentCount || 0}</span>
                    </div>
                  </div>

                  {!isTournament && (
                    <>
                      {/* Voting Interface */}
                      <CardContent className="pt-3 pb-3">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Option A */}
                          <motion.div whileHover={{ scale: hasVoted ? 1 : 1.02 }} whileTap={{ scale: hasVoted ? 1 : 0.98 }}>
                            <button
                              onClick={() => !hasVoted && handleImageClick(survey.id, 'A')}
                              disabled={hasVoted}
                              className={`w-full overflow-hidden transition-all ${
                                hasVoted ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg'
                              }`}
                              style={{
                                boxShadow: votingChoice === 'A' ? '8px 6px 0px rgba(0, 0, 0, 0.3)' : '5px 4px 0px rgba(0, 0, 0, 0.3)',
                                transform: votingChoice === 'A' ? 'rotate(-3deg)' : 'rotate(-1.5deg)'
                              }}
                            >
                              <img
                                src={question.optionAImage}
                                alt={question.optionA}
                                className="w-full h-40 object-cover"
                              />
                              <div className="p-2" style={{ backgroundColor: votingChoice === 'A' ? '#FFED00' : '#f5f5f5' }}>
                                <p className="text-sm font-semibold text-black">{question.optionA}</p>
                              </div>
                            </button>
                          </motion.div>

                          {/* Option B */}
                          <motion.div whileHover={{ scale: hasVoted ? 1 : 1.02 }} whileTap={{ scale: hasVoted ? 1 : 0.98 }}>
                            <button
                              onClick={() => !hasVoted && handleImageClick(survey.id, 'B')}
                              disabled={hasVoted}
                              className={`w-full overflow-hidden transition-all ${
                                hasVoted ? 'cursor-not-allowed opacity-60' : 'hover:shadow-lg'
                              }`}
                              style={{
                                boxShadow: votingChoice === 'B' ? '7px 8px 0px rgba(0, 0, 0, 0.3)' : '4px 6px 0px rgba(0, 0, 0, 0.3)',
                                transform: votingChoice === 'B' ? 'rotate(3deg)' : 'rotate(1.5deg)'
                              }}
                            >
                              <img
                                src={question.optionBImage}
                                alt={question.optionB}
                                className="w-full h-40 object-cover"
                              />
                              <div className="p-2" style={{ backgroundColor: votingChoice === 'B' ? '#FF10F0' : '#f5f5f5' }}>
                                <p className="text-sm font-semibold text-black">{question.optionB}</p>
                              </div>
                            </button>
                          </motion.div>
                        </div>

                        {/* Strength Selection */}
                        {votingChoice && !hasVoted && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 space-y-2"
                          >
                            <p className="text-center text-sm font-bold">How strong is your preference?</p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'by-a-hair')}
                                className="flex-1 font-bold text-xs py-2"
                                style={{ backgroundColor: '#FFED00', boxShadow: '3px 4px 0px rgba(0, 0, 0, 0.3)' }}
                              >
                                By a Hair
                              </Button>
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'comfortably')}
                                className="flex-1 font-bold text-xs py-2"
                                style={{ backgroundColor: '#FF10F0', boxShadow: '4px 3px 0px rgba(0, 0, 0, 0.3)' }}
                              >
                                Comfortably
                              </Button>
                              <Button
                                onClick={() => handleStrengthSelect(survey.id, 'no-brainer')}
                                className="flex-1 font-bold text-xs py-2"
                                style={{ backgroundColor: '#FFED00', boxShadow: '5px 4px 0px rgba(0, 0, 0, 0.3)' }}
                              >
                                No Brainer
                              </Button>
                            </div>
                          </motion.div>
                        )}

                        {hasVoted && (
                          <div className="mt-3 text-center">
                            <Button
                              onClick={() => onViewResults(survey.id)}
                              className="font-bold text-sm py-2"
                              style={{ backgroundColor: '#FF10F0', boxShadow: '4px 5px 0px rgba(0, 0, 0, 0.3)' }}
                            >
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Full Results
                            </Button>
                          </div>
                        )}
                      </CardContent>

                      {/* Comments */}
                      <div className="px-3 pb-3">
                        <CommentsSection surveyId={survey.id} />
                      </div>
                    </>
                  )}

                  {isTournament && (
                    <CardContent className="pt-3 pb-3">
                      {/* Compact Tournament Preview */}
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          {survey.tournamentItems?.slice(0, 4).map((item, idx) => (
                            <div key={item.id} className="flex items-center gap-2 p-1.5 bg-gray-50">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-8 h-8 object-cover"
                              />
                              <span className="text-xs font-semibold truncate">{item.name}</span>
                            </div>
                          ))}
                        </div>
                        {survey.tournamentItems && survey.tournamentItems.length > 4 && (
                          <p className="text-xs text-center mt-2 text-gray-600">
                            +{survey.tournamentItems.length - 4} more items
                          </p>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => onTakeSurvey(survey.id)}
                        size="lg"
                        className="w-full font-bold"
                        style={{ backgroundColor: '#FF10F0', boxShadow: '5px 5px 0px rgba(0, 0, 0, 0.3)' }}
                      >
                        <Trophy className="mr-2 h-5 w-5" />
                        Enter Tournament
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Instant Results Modal */}
      {showResults && (() => {
        const survey = surveys.find(s => s.id === showResults.surveyId);
        if (!survey || !survey.questions[0]) return null;
        
        return (
          <InstantResults
            question={survey.questions[0]}
            userChoice={showResults.choice}
            onClose={() => setShowResults(null)}
          />
        );
      })()}
    </div>
  );
}