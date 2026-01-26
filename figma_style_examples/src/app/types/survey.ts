export type SurveyType = 'standard' | 'tournament';

export type SurveyVisibility = 'public' | 'private';

export type ReactionType = 'fire' | 'laugh' | 'think' | 'eyes' | 'hundred';

export type SurveyCategory = 'fashion' | 'food' | 'entertainment' | 'sports' | 'lifestyle' | 'tech' | 'other';

export interface Comment {
  id: string;
  surveyId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Reaction {
  id: string;
  surveyId: string;
  userId: string;
  type: ReactionType;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  createdAt: string;
  votingStreak: number;
  lastVoteDate?: string;
  totalVotes: number;
  surveysCreated: number;
  following: string[]; // User IDs
  followers: string[]; // User IDs
}

export interface TournamentItem {
  id: string;
  name: string;
  image: string; // Base64 encoded image
}

export interface TournamentMatchup {
  id: string;
  round: number; // 0 = finals, 1 = semifinals, 2 = quarterfinals, etc.
  position: number; // Position in the round
  itemA: string | null; // Item ID or null for bye
  itemB: string | null; // Item ID or null for bye
  votesA: number;
  votesB: number;
  votesAByHair: number;
  votesAComfortably: number;
  votesANoBrainer: number;
  votesBByHair: number;
  votesBComfortably: number;
  votesBNoBrainer: number;
}

export interface Survey {
  id: string;
  title: string;
  surveyType: SurveyType;
  visibility: SurveyVisibility;
  creatorId: string; // User who created the survey
  creatorName?: string; // Creator display name
  inviteCode?: string; // For private surveys
  category?: SurveyCategory; // Category for filtering
  tags?: string[]; // Hashtags for discovery
  // Standard survey fields
  questions: Question[];
  // Tournament survey fields
  tournamentItems?: TournamentItem[];
  tournamentMatchups?: TournamentMatchup[];
  currentTournamentRound?: number; // Current active round (starts at max round, goes to 0 for finals)
  tournamentRoundVotesRequired?: number; // Votes needed to complete each round
  // Common fields
  responses: number;
  maxVotes: number; // Maximum votes before expiry
  isExpired: boolean; // Whether survey has reached max votes
  showIndividualVotes: boolean; // Privacy setting for expired surveys
  createdAt: string;
  // Engagement metrics
  views?: number;
  commentCount?: number;
  reactionCount?: number;
  shareCount?: number;
}

export interface SurveyResponse {
  questionId: string;
  choice: 'A' | 'B';
  strength: VoteStrength;
}

export interface TournamentResponse {
  matchupId: string;
  choice: 'A' | 'B';
  strength: VoteStrength;
}

export interface ParticipantResponse {
  id: string;
  surveyId: string;
  responses: SurveyResponse[];
  tournamentResponses?: TournamentResponse[];
  timestamp: string;
}