// Simple user management using localStorage
// In a real app, this would be handled by authentication

export function getCurrentUserId(): string {
  let userId = localStorage.getItem('binary-survey-user-id');
  
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('binary-survey-user-id', userId);
  }
  
  return userId;
}

export function generateInviteCode(): string {
  // Generate a 8-character invite code
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Track which private surveys a user has accessed
export function getAccessedPrivateSurveys(): string[] {
  const accessed = localStorage.getItem('binary-survey-accessed-private');
  return accessed ? JSON.parse(accessed) : [];
}

export function addAccessedPrivateSurvey(surveyId: string) {
  const accessed = getAccessedPrivateSurveys();
  if (!accessed.includes(surveyId)) {
    accessed.push(surveyId);
    localStorage.setItem('binary-survey-accessed-private', JSON.stringify(accessed));
  }
}
