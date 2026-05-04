import { SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, LeaderboardStore } from '../../interfaces/LeaderboardStore';

export class SupabaseLeaderboardStore implements LeaderboardStore {
  constructor(private supabase: SupabaseClient) {}

  async getRankings(competitionId: string): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.supabase.rpc('get_leaderboard', {
      p_competition_id: competitionId,
    });

    if (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any, index: number) => ({
      restaurant_id: row.restaurant_id,
      restaurant_name: row.restaurant_name,
      avg_overall_rating: parseFloat(row.avg_overall_rating) || 0,
      avg_taste: parseFloat(row.avg_taste) || 0,
      avg_value: parseFloat(row.avg_value) || 0,
      avg_vibe: parseFloat(row.avg_vibe) || 0,
      avg_wow: parseFloat(row.avg_wow) || 0,
      total_reviews: parseInt(row.total_reviews, 10) || 0,
      total_visits: parseInt(row.total_visits, 10) || 0,
      would_return_percentage: parseFloat(row.would_return_percentage) || 0,
      rank: index + 1,
    }));
  }
}
