import { TournamentItem, TournamentMatchup } from "@/app/types/survey";

export function generateTournamentBracket(items: TournamentItem[]): TournamentMatchup[] {
  const matchups: TournamentMatchup[] = [];
  
  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(items.length)));
  const numByes = bracketSize - items.length;
  
  // Shuffle items for random seeding
  const shuffledItems = [...items].sort(() => Math.random() - 0.5);
  
  // Add byes to the list (null represents a bye)
  const bracket: (TournamentItem | null)[] = [...shuffledItems];
  for (let i = 0; i < numByes; i++) {
    bracket.push(null);
  }
  
  // Calculate number of rounds
  const numRounds = Math.log2(bracketSize);
  
  // Generate first round matchups
  const firstRoundSize = bracketSize / 2;
  for (let i = 0; i < firstRoundSize; i++) {
    const itemA = bracket[i * 2];
    const itemB = bracket[i * 2 + 1];
    
    matchups.push({
      id: crypto.randomUUID(),
      round: numRounds - 1, // Rounds numbered from finals (0) backwards
      position: i,
      itemA: itemA?.id || null,
      itemB: itemB?.id || null,
      votesA: 0,
      votesB: 0,
      votesAByHair: 0,
      votesAComfortably: 0,
      votesANoBrainer: 0,
      votesBByHair: 0,
      votesBComfortably: 0,
      votesBNoBrainer: 0,
    });
  }
  
  // Generate placeholder matchups for subsequent rounds
  for (let round = numRounds - 2; round >= 0; round--) {
    const matchupsInRound = Math.pow(2, round);
    for (let i = 0; i < matchupsInRound; i++) {
      matchups.push({
        id: crypto.randomUUID(),
        round,
        position: i,
        itemA: null,
        itemB: null,
        votesA: 0,
        votesB: 0,
        votesAByHair: 0,
        votesAComfortably: 0,
        votesANoBrainer: 0,
        votesBByHair: 0,
        votesBComfortably: 0,
        votesBNoBrainer: 0,
      });
    }
  }
  
  return matchups;
}

export function getRoundName(round: number, totalRounds: number): string {
  const roundsFromEnd = round;
  
  if (roundsFromEnd === 0) return "Finals";
  if (roundsFromEnd === 1) return "Semifinals";
  if (roundsFromEnd === 2) return "Quarterfinals";
  if (roundsFromEnd === 3) return "Round of 16";
  if (roundsFromEnd === 4) return "Round of 32";
  
  return `Round ${totalRounds - round}`;
}

export function getWinnerOfMatchup(
  matchup: TournamentMatchup,
  items: TournamentItem[]
): string | null {
  // If it's a bye matchup, return the non-null item
  if (matchup.itemA === null) return matchup.itemB;
  if (matchup.itemB === null) return matchup.itemA;
  
  // If no votes yet, no winner
  if (matchup.votesA === 0 && matchup.votesB === 0) return null;
  
  // Return winner based on votes
  if (matchup.votesA > matchup.votesB) return matchup.itemA;
  if (matchup.votesB > matchup.votesA) return matchup.itemB;
  
  // In case of tie, return null (shouldn't happen with odd number of votes typically)
  return null;
}

export function advanceTournament(
  matchups: TournamentMatchup[],
  items: TournamentItem[]
): TournamentMatchup[] {
  const updatedMatchups = [...matchups];
  
  // Group matchups by round
  const rounds = new Map<number, TournamentMatchup[]>();
  matchups.forEach(m => {
    if (!rounds.has(m.round)) {
      rounds.set(m.round, []);
    }
    rounds.get(m.round)!.push(m);
  });
  
  // Process each round from latest to earliest
  const sortedRounds = Array.from(rounds.keys()).sort((a, b) => b - a);
  
  for (const roundNum of sortedRounds) {
    if (roundNum === 0) continue; // Skip finals, no advancement needed
    
    const currentRoundMatchups = rounds.get(roundNum)!;
    const nextRoundMatchups = rounds.get(roundNum - 1);
    
    if (!nextRoundMatchups) continue;
    
    // For each pair of matchups, advance winners to next round
    for (let i = 0; i < currentRoundMatchups.length; i += 2) {
      const matchup1 = currentRoundMatchups[i];
      const matchup2 = currentRoundMatchups[i + 1];
      const nextMatchup = nextRoundMatchups[Math.floor(i / 2)];
      
      if (nextMatchup) {
        const winner1 = getWinnerOfMatchup(matchup1, items);
        const winner2 = matchup2 ? getWinnerOfMatchup(matchup2, items) : null;
        
        const matchupIndex = updatedMatchups.findIndex(m => m.id === nextMatchup.id);
        if (matchupIndex !== -1) {
          updatedMatchups[matchupIndex] = {
            ...nextMatchup,
            itemA: winner1,
            itemB: winner2,
          };
        }
      }
    }
  }
  
  return updatedMatchups;
}
