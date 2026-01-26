import { Survey, Question, UserProfile } from '@/app/types/survey';

// Create mock user profiles
export function seedUserProfiles() {
  const profiles: UserProfile[] = [
    {
      id: 'user-punk-rebel',
      name: 'PunkRebel99',
      bio: 'Living life on my own terms 🎸',
      votingStreak: 15,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    },
    {
      id: 'user-fashion-guru',
      name: 'StyleQueen',
      bio: 'Fashion is my passion ✨',
      votingStreak: 8,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    },
    {
      id: 'user-foodie',
      name: 'TasteChaser',
      bio: 'Always hunting for the next great meal 🍕',
      votingStreak: 22,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    },
    {
      id: 'user-tech-nerd',
      name: 'ByteCrusher',
      bio: 'Code, coffee, repeat 💻',
      votingStreak: 5,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    },
    {
      id: 'user-sports-fan',
      name: 'GameDayHero',
      bio: 'Sports enthusiast and weekend warrior 🏀',
      votingStreak: 12,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    },
    {
      id: 'user-movie-buff',
      name: 'CinemaAddict',
      bio: 'Watched everything. Literally. 🎬',
      votingStreak: 30,
      followingIds: [],
      followerIds: [],
      isAnonymous: false,
      loginMethod: 'manual'
    }
  ];

  const existingProfiles = localStorage.getItem('user-profiles');
  const allProfiles = existingProfiles ? JSON.parse(existingProfiles) : [];
  
  // Add new profiles if they don't exist
  profiles.forEach(profile => {
    if (!allProfiles.find((p: UserProfile) => p.id === profile.id)) {
      allProfiles.push(profile);
    }
  });
  
  localStorage.setItem('user-profiles', JSON.stringify(allProfiles));
  return profiles;
}

// Create mock surveys from different users
export function seedSurveys() {
  const surveys: Survey[] = [
    {
      id: 'survey-fashion-1',
      title: 'Summer Vibes: Which Look Wins?',
      surveyType: 'standard',
      visibility: 'public',
      category: 'fashion',
      creatorId: 'user-fashion-guru',
      creatorName: 'StyleQueen',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      responses: 47,
      maxVotes: 100,
      isExpired: false,
      questions: [
        {
          id: 'q1',
          text: 'Which summer outfit is more your style?',
          optionA: 'Floral Dress',
          optionB: 'Denim Shorts & Crop Top',
          optionAImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
          votesA: 28,
          votesB: 19,
          votesAByHair: 8,
          votesAComfortably: 12,
          votesANoBrainer: 8,
          votesBByHair: 4,
          votesBComfortably: 8,
          votesBNoBrainer: 7,
          strengthVotes: {
            'by-a-hair': 12,
            'comfortably': 20,
            'no-brainer': 15
          }
        }
      ],
      commentCount: 8,
      reactionCount: 23,
      views: 156
    },
    {
      id: 'survey-food-1',
      title: 'Ultimate Comfort Food Showdown',
      surveyType: 'standard',
      visibility: 'public',
      category: 'food',
      creatorId: 'user-foodie',
      creatorName: 'TasteChaser',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      responses: 89,
      maxVotes: 150,
      isExpired: false,
      questions: [
        {
          id: 'q2',
          text: 'When you need comfort food, what do you crave?',
          optionA: 'Mac & Cheese',
          optionB: 'Pizza',
          optionAImage: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
          votesA: 34,
          votesB: 55,
          votesAByHair: 7,
          votesAComfortably: 15,
          votesANoBrainer: 12,
          votesBByHair: 11,
          votesBComfortably: 20,
          votesBNoBrainer: 24,
          strengthVotes: {
            'by-a-hair': 18,
            'comfortably': 35,
            'no-brainer': 36
          }
        }
      ],
      commentCount: 15,
      reactionCount: 42,
      views: 234
    },
    {
      id: 'survey-tech-1',
      title: 'Work Setup Battle: Desktop vs Laptop',
      surveyType: 'standard',
      visibility: 'public',
      category: 'tech',
      creatorId: 'user-tech-nerd',
      creatorName: 'ByteCrusher',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      responses: 62,
      maxVotes: 100,
      isExpired: false,
      questions: [
        {
          id: 'q3',
          text: 'What\'s your ideal work from home setup?',
          optionA: 'Powerful Desktop',
          optionB: 'Portable Laptop',
          optionAImage: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
          votesA: 38,
          votesB: 24,
          votesAByHair: 10,
          votesAComfortably: 18,
          votesANoBrainer: 10,
          votesBByHair: 12,
          votesBComfortably: 10,
          votesBNoBrainer: 2,
          strengthVotes: {
            'by-a-hair': 22,
            'comfortably': 28,
            'no-brainer': 12
          }
        }
      ],
      commentCount: 11,
      reactionCount: 19,
      views: 178
    },
    {
      id: 'survey-sports-1',
      title: 'Weekend Workout: Which Gets You Moving?',
      surveyType: 'standard',
      visibility: 'public',
      category: 'sports',
      creatorId: 'user-sports-fan',
      creatorName: 'GameDayHero',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      responses: 71,
      maxVotes: 120,
      isExpired: false,
      questions: [
        {
          id: 'q4',
          text: 'How do you prefer to stay active?',
          optionA: 'Running Outdoors',
          optionB: 'Gym Workout',
          optionAImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
          votesA: 44,
          votesB: 27,
          votesAByHair: 8,
          votesAComfortably: 20,
          votesANoBrainer: 16,
          votesBByHair: 7,
          votesBComfortably: 11,
          votesBNoBrainer: 9,
          strengthVotes: {
            'by-a-hair': 15,
            'comfortably': 31,
            'no-brainer': 25
          }
        }
      ],
      commentCount: 9,
      reactionCount: 28,
      views: 201
    },
    {
      id: 'survey-movies-1',
      title: 'Movie Night: Action or Drama?',
      surveyType: 'standard',
      visibility: 'public',
      category: 'entertainment',
      creatorId: 'user-movie-buff',
      creatorName: 'CinemaAddict',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      responses: 103,
      maxVotes: 150,
      isExpired: false,
      questions: [
        {
          id: 'q5',
          text: 'Friday night movie pick?',
          optionA: 'Epic Action Blockbuster',
          optionB: 'Emotional Drama',
          optionAImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400',
          votesA: 67,
          votesB: 36,
          votesAByHair: 15,
          votesAComfortably: 28,
          votesANoBrainer: 24,
          votesBByHair: 10,
          votesBComfortably: 16,
          votesBNoBrainer: 10,
          strengthVotes: {
            'by-a-hair': 25,
            'comfortably': 44,
            'no-brainer': 34
          }
        }
      ],
      commentCount: 22,
      reactionCount: 51,
      views: 312
    },
    {
      id: 'survey-lifestyle-1',
      title: 'Morning Person vs Night Owl',
      surveyType: 'standard',
      visibility: 'public',
      category: 'lifestyle',
      creatorId: 'user-punk-rebel',
      creatorName: 'PunkRebel99',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      responses: 134,
      maxVotes: 200,
      isExpired: false,
      questions: [
        {
          id: 'q6',
          text: 'When are you most productive?',
          optionA: 'Early Morning',
          optionB: 'Late Night',
          optionAImage: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400',
          optionBImage: 'https://images.unsplash.com/photo-1514416205405-fa6f7d0d2e8b?w=400',
          votesA: 52,
          votesB: 82,
          votesAByHair: 12,
          votesAComfortably: 24,
          votesANoBrainer: 16,
          votesBByHair: 18,
          votesBComfortably: 34,
          votesBNoBrainer: 30,
          strengthVotes: {
            'by-a-hair': 30,
            'comfortably': 58,
            'no-brainer': 46
          }
        }
      ],
      commentCount: 31,
      reactionCount: 67,
      views: 445
    },
    {
      id: 'tournament-snacks-1',
      title: 'Ultimate Snack World Cup 🏆',
      surveyType: 'tournament',
      visibility: 'public',
      category: 'food',
      creatorId: 'user-foodie',
      creatorName: 'TasteChaser',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      responses: 45,
      maxVotes: 100,
      isExpired: false,
      questions: [],
      tournamentItems: [
        { id: 'snack-1', name: 'Potato Chips', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
        { id: 'snack-2', name: 'Chocolate Bar', imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4cec8ea1?w=400' },
        { id: 'snack-3', name: 'Popcorn', imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400' },
        { id: 'snack-4', name: 'Ice Cream', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
        { id: 'snack-5', name: 'Cookies', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
        { id: 'snack-6', name: 'Nachos', imageUrl: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400' },
        { id: 'snack-7', name: 'Candy', imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400' },
        { id: 'snack-8', name: 'Pretzels', imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400' }
      ],
      tournamentBracket: {
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            matchups: [
              { id: 'm1', itemA: 'snack-1', itemB: 'snack-2', votesA: 12, votesB: 8, winner: null },
              { id: 'm2', itemA: 'snack-3', itemB: 'snack-4', votesA: 15, votesB: 10, winner: null },
              { id: 'm3', itemA: 'snack-5', itemB: 'snack-6', votesA: 9, votesB: 11, winner: null },
              { id: 'm4', itemA: 'snack-7', itemB: 'snack-8', votesA: 7, votesB: 13, winner: null }
            ]
          }
        ]
      },
      commentCount: 18,
      reactionCount: 34,
      views: 187
    },
    {
      id: 'tournament-movies-1',
      title: 'Best Action Movie of All Time 🎬',
      surveyType: 'tournament',
      visibility: 'public',
      category: 'entertainment',
      creatorId: 'user-movie-buff',
      creatorName: 'CinemaAddict',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      responses: 78,
      maxVotes: 150,
      isExpired: false,
      questions: [],
      tournamentItems: [
        { id: 'movie-1', name: 'Die Hard', imageUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400' },
        { id: 'movie-2', name: 'Mad Max: Fury Road', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' },
        { id: 'movie-3', name: 'The Matrix', imageUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400' },
        { id: 'movie-4', name: 'John Wick', imageUrl: 'https://images.unsplash.com/photo-1574267432644-f610a91acd90?w=400' },
        { id: 'movie-5', name: 'Terminator 2', imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400' },
        { id: 'movie-6', name: 'The Dark Knight', imageUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400' },
        { id: 'movie-7', name: 'Inception', imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
        { id: 'movie-8', name: 'Gladiator', imageUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400' }
      ],
      tournamentBracket: {
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            matchups: [
              { id: 'm1', itemA: 'movie-1', itemB: 'movie-2', votesA: 18, votesB: 22, winner: null },
              { id: 'm2', itemA: 'movie-3', itemB: 'movie-4', votesA: 25, votesB: 13, winner: null },
              { id: 'm3', itemA: 'movie-5', itemB: 'movie-6', votesA: 16, votesB: 28, winner: null },
              { id: 'm4', itemA: 'movie-7', itemB: 'movie-8', votesA: 21, votesB: 19, winner: null }
            ]
          }
        ]
      },
      commentCount: 26,
      reactionCount: 45,
      views: 298
    },
    {
      id: 'tournament-workout-1',
      title: 'Best Workout Exercise Showdown 💪',
      surveyType: 'tournament',
      visibility: 'public',
      category: 'sports',
      creatorId: 'user-sports-fan',
      creatorName: 'GameDayHero',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
      responses: 56,
      maxVotes: 120,
      isExpired: false,
      questions: [],
      tournamentItems: [
        { id: 'workout-1', name: 'Push-ups', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' },
        { id: 'workout-2', name: 'Squats', imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400' },
        { id: 'workout-3', name: 'Deadlifts', imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400' },
        { id: 'workout-4', name: 'Burpees', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' },
        { id: 'workout-5', name: 'Planks', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
        { id: 'workout-6', name: 'Pull-ups', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400' },
        { id: 'workout-7', name: 'Lunges', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400' },
        { id: 'workout-8', name: 'Jump Rope', imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400' }
      ],
      tournamentBracket: {
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            matchups: [
              { id: 'm1', itemA: 'workout-1', itemB: 'workout-2', votesA: 14, votesB: 12, winner: null },
              { id: 'm2', itemA: 'workout-3', itemB: 'workout-4', votesA: 17, votesB: 9, winner: null },
              { id: 'm3', itemA: 'workout-5', itemB: 'workout-6', votesA: 11, votesB: 15, winner: null },
              { id: 'm4', itemA: 'workout-7', itemB: 'workout-8', votesA: 13, votesB: 10, winner: null }
            ]
          }
        ]
      },
      commentCount: 12,
      reactionCount: 29,
      views: 203
    },
    {
      id: 'tournament-tech-1',
      title: 'Programming Language Battle Royale 💻',
      surveyType: 'tournament',
      visibility: 'public',
      category: 'tech',
      creatorId: 'user-tech-nerd',
      creatorName: 'ByteCrusher',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), // 15 hours ago
      responses: 92,
      maxVotes: 200,
      isExpired: false,
      questions: [],
      tournamentItems: [
        { id: 'lang-1', name: 'JavaScript', imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400' },
        { id: 'lang-2', name: 'Python', imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400' },
        { id: 'lang-3', name: 'TypeScript', imageUrl: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=400' },
        { id: 'lang-4', name: 'Rust', imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400' },
        { id: 'lang-5', name: 'Go', imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400' },
        { id: 'lang-6', name: 'Java', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
        { id: 'lang-7', name: 'C++', imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400' },
        { id: 'lang-8', name: 'Swift', imageUrl: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=400' }
      ],
      tournamentBracket: {
        currentRound: 1,
        rounds: [
          {
            roundNumber: 1,
            matchups: [
              { id: 'm1', itemA: 'lang-1', itemB: 'lang-2', votesA: 22, votesB: 28, winner: null },
              { id: 'm2', itemA: 'lang-3', itemB: 'lang-4', votesA: 19, votesB: 23, winner: null },
              { id: 'm3', itemA: 'lang-5', itemB: 'lang-6', votesA: 24, votesB: 18, winner: null },
              { id: 'm4', itemA: 'lang-7', itemB: 'lang-8', votesA: 16, votesB: 20, winner: null }
            ]
          }
        ]
      },
      commentCount: 35,
      reactionCount: 58,
      views: 412
    }
  ];

  const existingSurveys = localStorage.getItem('binary-surveys');
  const allSurveys = existingSurveys ? JSON.parse(existingSurveys) : [];
  
  // Add new surveys if they don't exist
  surveys.forEach(survey => {
    if (!allSurveys.find((s: Survey) => s.id === survey.id)) {
      allSurveys.push(survey);
    }
  });
  
  localStorage.setItem('binary-surveys', JSON.stringify(allSurveys));
  return surveys;
}

// Main seed function to run both
export function seedAllData(currentUserId?: string) {
  const profiles = seedUserProfiles();
  const surveys = seedSurveys();
  console.log('✅ Seeded mock users and surveys!');
  return surveys;
}