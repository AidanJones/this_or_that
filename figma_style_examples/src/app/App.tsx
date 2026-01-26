import { useState, useEffect } from "react";
import { SurveyList } from "@/app/components/survey-list";
import { SurveyCreator } from "@/app/components/survey-creator";
import { SurveyTaker } from "@/app/components/survey-taker";
import { SurveyResults } from "@/app/components/survey-results";
import { TournamentCreator } from "@/app/components/tournament-creator";
import { TournamentTaker } from "@/app/components/tournament-taker";
import { TournamentResults } from "@/app/components/tournament-results";
import { EnhancedFeed } from "@/app/components/enhanced-feed";
import { SurveyCreatedModal } from "@/app/components/survey-created-modal";
import { ProfileModal } from "@/app/components/profile-modal";
import { Survey, Question, SurveyResponse, TournamentResponse, ParticipantResponse, TournamentItem, SurveyVisibility } from "@/app/types/survey";
import { generateTournamentBracket, advanceTournament } from "@/app/utils/tournament";
import { generateInviteCode, addAccessedPrivateSurvey } from "@/app/utils/user";
import { getCurrentUserId, getCurrentUserProfile, updateUserProfile, updateVotingStreak } from "@/app/utils/profile";
import { seedAllData } from "@/app/utils/seed-data";
import { Button } from "@/app/components/ui/button";
import { Home, PlusCircle, List, Trophy, Lock, User } from "lucide-react";
import { StreakDisplay } from "@/app/components/streak-display";

type View = 'feed' | 'my-surveys' | 'create' | 'create-tournament' | 'take' | 'results';

function App() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [participantResponses, setParticipantResponses] = useState<ParticipantResponse[]>([]);
  const [currentView, setCurrentView] = useState<View>('feed');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [createdSurvey, setCreatedSurvey] = useState<Survey | null>(null);
  const [currentUserId] = useState(getCurrentUserId());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load surveys from localStorage on mount
  useEffect(() => {
    // Always seed data first to ensure mock surveys exist
    const seededSurveys = seedAllData(currentUserId);
    
    const storedSurveys = localStorage.getItem('binary-surveys');
    if (storedSurveys) {
      const parsedSurveys = JSON.parse(storedSurveys);
      setSurveys(parsedSurveys);
    }
  }, []);

  // Save surveys to localStorage whenever they change
  useEffect(() => {
    if (surveys.length > 0) {
      localStorage.setItem('binary-surveys', JSON.stringify(surveys));
    }
  }, [surveys]);

  // Save participant responses to localStorage whenever they change
  useEffect(() => {
    if (participantResponses.length > 0) {
      localStorage.setItem('binary-participant-responses', JSON.stringify(participantResponses));
    }
  }, [participantResponses]);

  const handleCreateSurvey = (title: string, questions: Question[], maxVotes: number, visibility: SurveyVisibility) => {
    const newSurvey: Survey = {
      id: crypto.randomUUID(),
      title,
      surveyType: 'standard',
      visibility,
      creatorId: currentUserId,
      inviteCode: visibility === 'private' ? generateInviteCode() : undefined,
      questions,
      responses: 0,
      maxVotes,
      isExpired: false,
      showIndividualVotes: false,
      createdAt: new Date().toISOString()
    };

    setSurveys([newSurvey, ...surveys]);
    setCreatedSurvey(newSurvey);
  };

  const handleCreateTournament = (title: string, items: TournamentItem[], maxVotes: number, visibility: SurveyVisibility) => {
    const matchups = generateTournamentBracket(items);
    
    // Calculate the maximum round number
    const maxRound = Math.max(...matchups.map(m => m.round));
    
    const newSurvey: Survey = {
      id: crypto.randomUUID(),
      title,
      surveyType: 'tournament',
      visibility,
      creatorId: currentUserId,
      inviteCode: visibility === 'private' ? generateInviteCode() : undefined,
      questions: [],
      tournamentItems: items,
      tournamentMatchups: matchups,
      currentTournamentRound: maxRound, // Start at the first round (highest number)
      tournamentRoundVotesRequired: 5, // Default: 5 votes needed to complete each round
      responses: 0,
      maxVotes,
      isExpired: false,
      showIndividualVotes: false,
      createdAt: new Date().toISOString()
    };

    setSurveys([newSurvey, ...surveys]);
    setCreatedSurvey(newSurvey);
  };

  const handleCompleteSurvey = (surveyId: string, responses: SurveyResponse[]) => {
    // Store participant responses
    const participantResponse: ParticipantResponse = {
      id: crypto.randomUUID(),
      surveyId,
      responses,
      timestamp: new Date().toISOString()
    };
    setParticipantResponses([...participantResponses, participantResponse]);

    // Update survey with aggregated data
    setSurveys(surveys.map(survey => {
      if (survey.id !== surveyId) return survey;

      const updatedQuestions = survey.questions.map(question => {
        const response = responses.find(r => r.questionId === question.id);
        if (!response) return question;

        // Update vote counts by choice and strength
        const updates: any = { ...question };
        
        if (response.choice === 'A') {
          updates.votesA = question.votesA + 1;
          if (response.strength === 'by-a-hair') {
            updates.votesAByHair = question.votesAByHair + 1;
          } else if (response.strength === 'comfortably') {
            updates.votesAComfortably = question.votesAComfortably + 1;
          } else if (response.strength === 'no-brainer') {
            updates.votesANoBrainer = question.votesANoBrainer + 1;
          }
        } else {
          updates.votesB = question.votesB + 1;
          if (response.strength === 'by-a-hair') {
            updates.votesBByHair = question.votesBByHair + 1;
          } else if (response.strength === 'comfortably') {
            updates.votesBComfortably = question.votesBComfortably + 1;
          } else if (response.strength === 'no-brainer') {
            updates.votesBNoBrainer = question.votesBNoBrainer + 1;
          }
        }

        return updates;
      });

      const newResponseCount = survey.responses + 1;
      const isExpired = newResponseCount >= survey.maxVotes;

      return {
        ...survey,
        questions: updatedQuestions,
        responses: newResponseCount,
        isExpired
      };
    }));

    // Update user profile and voting streak
    updateVotingStreak();
    setUserProfile(getCurrentUserProfile());
  };

  const handleCompleteTournament = (surveyId: string, tournamentResponses: TournamentResponse[]) => {
    // Store participant responses
    const participantResponse: ParticipantResponse = {
      id: crypto.randomUUID(),
      surveyId,
      responses: [],
      tournamentResponses,
      timestamp: new Date().toISOString()
    };
    setParticipantResponses([...participantResponses, participantResponse]);

    // Update tournament with aggregated data
    setSurveys(surveys.map(survey => {
      if (survey.id !== surveyId || !survey.tournamentMatchups || !survey.tournamentItems) return survey;

      const updatedMatchups = survey.tournamentMatchups.map(matchup => {
        const response = tournamentResponses.find(r => r.matchupId === matchup.id);
        if (!response) return matchup;

        const updates: any = { ...matchup };
        
        if (response.choice === 'A') {
          updates.votesA = matchup.votesA + 1;
          if (response.strength === 'by-a-hair') {
            updates.votesAByHair = matchup.votesAByHair + 1;
          } else if (response.strength === 'comfortably') {
            updates.votesAComfortably = matchup.votesAComfortably + 1;
          } else if (response.strength === 'no-brainer') {
            updates.votesANoBrainer = matchup.votesANoBrainer + 1;
          }
        } else {
          updates.votesB = matchup.votesB + 1;
          if (response.strength === 'by-a-hair') {
            updates.votesBByHair = matchup.votesBByHair + 1;
          } else if (response.strength === 'comfortably') {
            updates.votesBComfortably = matchup.votesBComfortably + 1;
          } else if (response.strength === 'no-brainer') {
            updates.votesBNoBrainer = matchup.votesBNoBrainer + 1;
          }
        }

        return updates;
      });

      // Check if current round has enough votes to advance
      const currentRound = survey.currentTournamentRound ?? 0;
      const currentRoundMatchups = updatedMatchups.filter(m => m.round === currentRound);
      const minVotesInRound = Math.min(...currentRoundMatchups.map(m => m.votesA + m.votesB));
      const requiredVotes = survey.tournamentRoundVotesRequired ?? 5;
      
      let newCurrentRound = currentRound;
      if (minVotesInRound >= requiredVotes && currentRound > 0) {
        // Advance tournament bracket based on current votes
        const advancedMatchups = advanceTournament(updatedMatchups, survey.tournamentItems);
        newCurrentRound = currentRound - 1; // Move to next round (lower number)
        
        const newResponseCount = survey.responses + 1;
        const isExpired = newResponseCount >= survey.maxVotes || newCurrentRound < 0;

        return {
          ...survey,
          tournamentMatchups: advancedMatchups,
          currentTournamentRound: newCurrentRound,
          responses: newResponseCount,
          isExpired
        };
      }

      const newResponseCount = survey.responses + 1;
      const isExpired = newResponseCount >= survey.maxVotes;

      return {
        ...survey,
        tournamentMatchups: updatedMatchups,
        responses: newResponseCount,
        isExpired
      };
    }));

    // Update user profile and voting streak
    updateVotingStreak();
    setUserProfile(getCurrentUserProfile());
  };

  const handleTogglePrivacy = (surveyId: string, showIndividual: boolean) => {
    setSurveys(surveys.map(survey => 
      survey.id === surveyId 
        ? { ...survey, showIndividualVotes: showIndividual }
        : survey
    ));
  };

  const handleAccessPrivateSurvey = (inviteCode: string) => {
    const survey = surveys.find(s => s.inviteCode === inviteCode);
    if (survey) {
      addAccessedPrivateSurvey(survey.id);
      setSelectedSurveyId(survey.id);
      setCurrentView('take');
    } else {
      alert('Invalid invite code. Please check and try again.');
    }
  };

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
  const selectedSurveyResponses = participantResponses.filter(r => r.surveyId === selectedSurveyId);
  const mySurveys = surveys.filter(s => s.creatorId === currentUserId);

  return (
    <>
      {/* Top Logo Bar - Only visible when not taking survey or viewing results */}
      {currentView !== 'take' && currentView !== 'results' && (
        <div className="bg-white sticky top-0 z-[100]" style={{ boxShadow: '0px 4px 0px rgba(0, 0, 0, 0.3)' }}>
          <div className="max-w-7xl mx-auto px-2 py-2">
            <div className="flex items-center justify-center gap-4">
              {/* Logo */}
              <button 
                onClick={() => setCurrentView('feed')}
                className="px-1 py-0.5 relative" 
                style={{ 
                  backgroundColor: '#FFED00', 
                  width: 'fit-content', 
                  lineHeight: '0.3',
                  boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)',
                  transform: 'rotate(-4deg)'
                }}
              >
                <div className="newsprint-text text-xl" style={{ transform: 'rotate(-2deg)', color: '#000000' }}>
                  <span className="ransom-letter-lg">T</span>
                  <span className="ransom-letter-sm">H</span>
                  <span className="ransom-letter-md">I</span>
                  <span className="ransom-letter-lg">S</span>
                </div>
                <div className="newsprint-condensed text-base -mt-3" style={{ transform: 'rotate(3deg)', color: '#FF10F0', marginLeft: '8px' }}>
                  <span className="ransom-letter-md">O</span>
                  <span className="ransom-letter-xl">R</span>
                </div>
                <div className="newsprint-text text-lg -mt-3" style={{ transform: 'rotate(-1deg)', color: '#000000', marginLeft: '4px' }}>
                  <span className="ransom-letter-md">T</span>
                  <span className="ransom-letter-lg">H</span>
                  <span className="ransom-letter-sm">A</span>
                  <span className="ransom-letter-lg">T</span>
                </div>
              </button>
              <p className="text-sm font-bold uppercase tracking-wide hidden sm:block" style={{ color: '#000000' }}>
                Have Your Say
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with bottom padding to prevent bottom nav overlap */}
      <div className={currentView !== 'take' && currentView !== 'results' ? 'pb-24' : ''}>
        {currentView === 'feed' && (
          <EnhancedFeed
            surveys={surveys}
            onTakeSurvey={(id) => {
              setSelectedSurveyId(id);
              setCurrentView('take');
            }}
            onViewResults={(id) => {
              setSelectedSurveyId(id);
              setCurrentView('results');
            }}
            onCompleteSurvey={handleCompleteSurvey}
            onAccessPrivateSurvey={handleAccessPrivateSurvey}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )}

        {currentView === 'my-surveys' && (
          <SurveyList
            surveys={mySurveys}
            onCreateNew={() => setCurrentView('create')}
            onCreateTournament={() => setCurrentView('create-tournament')}
            onTakeSurvey={(id) => {
              setSelectedSurveyId(id);
              setCurrentView('take');
            }}
            onViewResults={(id) => {
              setSelectedSurveyId(id);
              setCurrentView('results');
            }}
          />
        )}

        {currentView === 'create' && (
          <SurveyCreator
            onBack={() => setCurrentView('my-surveys')}
            onSave={handleCreateSurvey}
          />
        )}

        {currentView === 'create-tournament' && (
          <TournamentCreator
            onBack={() => setCurrentView('my-surveys')}
            onSave={handleCreateTournament}
          />
        )}

        {currentView === 'take' && selectedSurvey && (
          selectedSurvey.surveyType === 'tournament' ? (
            <TournamentTaker
              survey={selectedSurvey}
              onBack={() => {
                setCurrentView('feed');
                setSelectedSurveyId(null);
              }}
              onComplete={handleCompleteTournament}
            />
          ) : (
            <SurveyTaker
              survey={selectedSurvey}
              onBack={() => {
                setCurrentView('feed');
                setSelectedSurveyId(null);
              }}
              onComplete={handleCompleteSurvey}
            />
          )
        )}

        {currentView === 'results' && selectedSurvey && (
          selectedSurvey.surveyType === 'tournament' ? (
            <TournamentResults
              survey={selectedSurvey}
              participantResponses={selectedSurveyResponses}
              onBack={() => {
                setCurrentView('feed');
                setSelectedSurveyId(null);
              }}
              onTogglePrivacy={handleTogglePrivacy}
            />
          ) : (
            <SurveyResults
              survey={selectedSurvey}
              participantResponses={selectedSurveyResponses}
              onBack={() => {
                setCurrentView('feed');
                setSelectedSurveyId(null);
              }}
              onTogglePrivacy={handleTogglePrivacy}
            />
          )
        )}
      </div>

      {/* Survey Created Modal */}
      {createdSurvey && (
        <SurveyCreatedModal
          survey={createdSurvey}
          onClose={() => {
            setCreatedSurvey(null);
            setCurrentView('feed');
          }}
        />
      )}

      {/* Voting Streak Display */}
      <StreakDisplay streak={userProfile.votingStreak} />

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          userProfile={userProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Bottom Navigation Bar - Always visible except during survey taking */}
      {currentView !== 'take' && currentView !== 'results' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white z-[100]" style={{ boxShadow: '0px -6px 0px rgba(0, 0, 0, 0.3)' }}>
          <div className="max-w-7xl mx-auto px-1 py-2">
            <div className="flex items-center justify-around gap-0.5">
              {/* Feed */}
              <button
                onClick={() => setCurrentView('feed')}
                className="flex flex-col items-center justify-center px-2 py-1.5 min-w-0 font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: currentView === 'feed' ? '#FFED00' : '#FFFFFF',
                  boxShadow: currentView === 'feed' ? '2px 2px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)',
                  transform: currentView === 'feed' ? 'rotate(-1deg)' : 'none'
                }}
              >
                <Home className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                <span className="text-[10px] sm:text-xs leading-tight">FEED</span>
              </button>

              {/* My Surveys */}
              <button
                onClick={() => setCurrentView('my-surveys')}
                className="flex flex-col items-center justify-center px-2 py-1.5 min-w-0 font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: currentView === 'my-surveys' ? '#FF10F0' : '#FFFFFF',
                  boxShadow: currentView === 'my-surveys' ? '2px 2px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)',
                  transform: currentView === 'my-surveys' ? 'rotate(1deg)' : 'none'
                }}
              >
                <List className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                <span className="text-[10px] sm:text-xs leading-tight">SURVEYS</span>
              </button>

              {/* Create Survey */}
              <button
                onClick={() => setCurrentView('create')}
                className="flex flex-col items-center justify-center px-2 py-1.5 min-w-0 font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: currentView === 'create' ? '#FFED00' : '#FFFFFF',
                  boxShadow: currentView === 'create' ? '3px 3px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)',
                  transform: currentView === 'create' ? 'rotate(-2deg)' : 'none'
                }}
              >
                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                <span className="text-[10px] sm:text-xs leading-tight">CREATE</span>
              </button>

              {/* Create Tournament */}
              <button
                onClick={() => setCurrentView('create-tournament')}
                className="flex flex-col items-center justify-center px-2 py-1.5 min-w-0 font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: currentView === 'create-tournament' ? '#FF10F0' : '#FFFFFF',
                  boxShadow: currentView === 'create-tournament' ? '3px 3px 0px rgba(0, 0, 0, 0.3)' : '1px 1px 0px rgba(0, 0, 0, 0.2)',
                  transform: currentView === 'create-tournament' ? 'rotate(2deg)' : 'none'
                }}
              >
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                <span className="text-[10px] sm:text-xs leading-tight">TOURNEY</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex flex-col items-center justify-center px-2 py-1.5 min-w-0 font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '1px 1px 0px rgba(0, 0, 0, 0.2)'
                }}
              >
                <User className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                <span className="text-[10px] sm:text-xs leading-tight">PROFILE</span>
              </button>

              {/* Menu Dropdown */}
              <div className="relative min-w-0">
                <Button
                  className="text-black font-bold px-2 py-1.5 text-[10px] sm:text-xs h-auto min-w-0"
                  style={{ backgroundColor: '#FF10F0', boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.3)' }}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  MENU ▼
                </Button>
                {isMenuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-[101]"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    {/* Menu - positioned to never go off screen */}
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-white z-[102] w-48"
                      style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.3)' }}
                    >
                      <button
                        onClick={() => {
                          setCurrentView('feed');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black hover:text-white font-bold flex items-center gap-2 text-sm"
                        style={{ 
                          color: currentView === 'feed' ? '#FF10F0' : '#000000',
                          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Home className="h-4 w-4" />
                        <span>Feed</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black hover:text-white font-bold flex items-center gap-2 text-sm"
                        style={{ 
                          color: '#000000',
                          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('my-surveys');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black hover:text-white font-bold flex items-center gap-2 text-sm"
                        style={{ 
                          color: currentView === 'my-surveys' ? '#FF10F0' : '#000000',
                          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <List className="h-4 w-4" />
                        <span>My Surveys</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('create');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black hover:text-white font-bold flex items-center gap-2 text-sm"
                        style={{ 
                          backgroundColor: '#FFED00', 
                          color: '#000000',
                          boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create Survey</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('create-tournament');
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-black hover:text-white font-bold flex items-center gap-2 text-sm"
                        style={{ 
                          backgroundColor: '#FF10F0', 
                          color: '#000000'
                        }}
                      >
                        <Trophy className="h-4 w-4" />
                        <span>Create Tournament</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;