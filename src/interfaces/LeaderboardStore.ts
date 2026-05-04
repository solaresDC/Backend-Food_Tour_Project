export interface LeaderboardEntry {
  restaurant_id: string;
  restaurant_name: string;
  avg_overall_rating: number;
  avg_taste: number;
  avg_value: number;
  avg_vibe: number;
  avg_wow: number;
  total_reviews: number;
  total_visits: number;
  would_return_percentage: number;
  rank: number;
}

export interface LeaderboardStore {
  getRankings(competitionId: string): Promise<LeaderboardEntry[]>;
}
