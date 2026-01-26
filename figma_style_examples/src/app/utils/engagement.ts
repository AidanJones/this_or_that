import { Comment, Reaction, ReactionType } from "@/app/types/survey";
import { getCurrentUserId, getCurrentUserProfile } from "@/app/utils/profile";

const COMMENTS_KEY = 'binary-comments';
const REACTIONS_KEY = 'binary-reactions';

// Comments
export function getAllComments(): Comment[] {
  const stored = localStorage.getItem(COMMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveComments(comments: Comment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getCommentsForSurvey(surveyId: string): Comment[] {
  return getAllComments()
    .filter(c => c.surveyId === surveyId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addComment(surveyId: string, text: string): Comment {
  const profile = getCurrentUserProfile();
  const comment: Comment = {
    id: crypto.randomUUID(),
    surveyId,
    userId: profile.id,
    userName: profile.name,
    text,
    timestamp: new Date().toISOString()
  };
  
  const comments = getAllComments();
  comments.push(comment);
  saveComments(comments);
  
  return comment;
}

export function deleteComment(commentId: string) {
  const comments = getAllComments();
  const filtered = comments.filter(c => c.id !== commentId);
  saveComments(filtered);
}

// Reactions
export function getAllReactions(): Reaction[] {
  const stored = localStorage.getItem(REACTIONS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveReactions(reactions: Reaction[]) {
  localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions));
}

export function getReactionsForSurvey(surveyId: string): Reaction[] {
  return getAllReactions().filter(r => r.surveyId === surveyId);
}

export function addReaction(surveyId: string, type: ReactionType): Reaction {
  const userId = getCurrentUserId();
  const reactions = getAllReactions();
  
  // Check if user already reacted with this type
  const existing = reactions.find(
    r => r.surveyId === surveyId && r.userId === userId && r.type === type
  );
  
  if (existing) {
    // Remove reaction (toggle off)
    const filtered = reactions.filter(r => r.id !== existing.id);
    saveReactions(filtered);
    return existing;
  }
  
  // Add new reaction
  const reaction: Reaction = {
    id: crypto.randomUUID(),
    surveyId,
    userId,
    type,
    timestamp: new Date().toISOString()
  };
  
  reactions.push(reaction);
  saveReactions(reactions);
  
  return reaction;
}

export function getUserReactionForSurvey(surveyId: string): ReactionType | null {
  const userId = getCurrentUserId();
  const reactions = getAllReactions();
  const userReaction = reactions.find(r => r.surveyId === surveyId && r.userId === userId);
  return userReaction ? userReaction.type : null;
}

export function getReactionCounts(surveyId: string): Record<ReactionType, number> {
  const reactions = getReactionsForSurvey(surveyId);
  const counts: Record<ReactionType, number> = {
    fire: 0,
    laugh: 0,
    think: 0,
    eyes: 0,
    hundred: 0
  };
  
  reactions.forEach(r => {
    counts[r.type]++;
  });
  
  return counts;
}
