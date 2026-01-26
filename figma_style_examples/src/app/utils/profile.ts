import { UserProfile } from "@/app/types/survey";

const PROFILES_KEY = 'binary-user-profiles';
const CURRENT_USER_KEY = 'binary-current-user-id';

export function getCurrentUserProfile(): UserProfile {
  const userId = getCurrentUserId();
  const profiles = getAllProfiles();
  
  let profile = profiles.find(p => p.id === userId);
  
  if (!profile) {
    // Create new profile
    profile = {
      id: userId,
      name: `User${Math.floor(Math.random() * 9999)}`,
      createdAt: new Date().toISOString(),
      votingStreak: 0,
      totalVotes: 0,
      surveysCreated: 0,
      following: [],
      followers: []
    };
    profiles.push(profile);
    saveProfiles(profiles);
  }
  
  return profile;
}

export function getCurrentUserId(): string {
  let userId = localStorage.getItem(CURRENT_USER_KEY);
  if (!userId) {
    userId = `user-${crypto.randomUUID()}`;
    localStorage.setItem(CURRENT_USER_KEY, userId);
  }
  return userId;
}

export function getAllProfiles(): UserProfile[] {
  const stored = localStorage.getItem(PROFILES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function updateUserProfile(updates: Partial<UserProfile>) {
  const profiles = getAllProfiles();
  const userId = getCurrentUserId();
  const index = profiles.findIndex(p => p.id === userId);
  
  if (index >= 0) {
    profiles[index] = { ...profiles[index], ...updates };
  } else {
    const newProfile = {
      ...getCurrentUserProfile(),
      ...updates
    };
    profiles.push(newProfile);
  }
  
  saveProfiles(profiles);
}

export function updateVotingStreak() {
  const profile = getCurrentUserProfile();
  const today = new Date().toDateString();
  const lastVoteDate = profile.lastVoteDate ? new Date(profile.lastVoteDate).toDateString() : null;
  
  let newStreak = profile.votingStreak;
  
  if (lastVoteDate === today) {
    // Already voted today, don't update streak
    return profile.votingStreak;
  }
  
  if (!lastVoteDate) {
    // First vote ever
    newStreak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastVoteDate === yesterdayString) {
      // Voted yesterday, increment streak
      newStreak = profile.votingStreak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
  }
  
  updateUserProfile({
    votingStreak: newStreak,
    lastVoteDate: new Date().toISOString(),
    totalVotes: profile.totalVotes + 1
  });
  
  return newStreak;
}

export function followUser(userIdToFollow: string) {
  const profile = getCurrentUserProfile();
  if (!profile.following.includes(userIdToFollow)) {
    updateUserProfile({
      following: [...profile.following, userIdToFollow]
    });
    
    // Update the followed user's followers
    const profiles = getAllProfiles();
    const targetProfile = profiles.find(p => p.id === userIdToFollow);
    if (targetProfile) {
      targetProfile.followers = [...(targetProfile.followers || []), profile.id];
      saveProfiles(profiles);
    }
  }
}

export function unfollowUser(userIdToUnfollow: string) {
  const profile = getCurrentUserProfile();
  updateUserProfile({
    following: profile.following.filter(id => id !== userIdToUnfollow)
  });
  
  // Update the unfollowed user's followers
  const profiles = getAllProfiles();
  const targetProfile = profiles.find(p => p.id === userIdToUnfollow);
  if (targetProfile) {
    targetProfile.followers = (targetProfile.followers || []).filter(id => id !== profile.id);
    saveProfiles(profiles);
  }
}

export function isFollowing(userId: string): boolean {
  const profile = getCurrentUserProfile();
  return profile.following.includes(userId);
}

export function getProfileById(userId: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles.find(p => p.id === userId) || null;
}
