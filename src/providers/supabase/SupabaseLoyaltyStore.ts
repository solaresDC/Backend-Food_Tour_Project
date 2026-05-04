import { SupabaseClient } from '@supabase/supabase-js';
import { LoyaltyCard, LoyaltyStore } from '../../interfaces/LoyaltyStore';

export class SupabaseLoyaltyStore implements LoyaltyStore {
  constructor(private supabase: SupabaseClient) {}

  async getByUser(userId: string, competitionId: string): Promise<LoyaltyCard | null> {
    const { data: competition, error: compError } = await this.supabase
      .from('competitions')
      .select('reward_config')
      .eq('id', competitionId)
      .maybeSingle();

    if (compError) {
      throw new Error(`Failed to fetch competition config: ${compError.message}`);
    }

    if (!competition) {
      return null;
    }

    const { data: visits, error: visitError } = await this.supabase
      .from('visits')
      .select('restaurant_id')
      .eq('user_id', userId)
      .eq('competition_id', competitionId)
      .eq('validation_status', 'valid');

    if (visitError) {
      throw new Error(`Failed to fetch user visits: ${visitError.message}`);
    }

    const visitedRestaurantIds = [
      ...new Set((visits || []).map((v: any) => v.restaurant_id)),
    ];
    const stampsEarned = visitedRestaurantIds.length;

    const rewardConfig = competition.reward_config as {
      tiers: Array<{
        tier: number;
        visits_required: number;
        reward_description: string;
        redeemable_at: string;
      }>;
      total_restaurants: number;
    };

    let tierReached = 0;
    const tiersWithStatus = rewardConfig.tiers.map((tier) => {
      const unlocked = stampsEarned >= tier.visits_required;
      if (unlocked) {
        tierReached = tier.tier;
      }
      return { ...tier, unlocked };
    });

    return {
      user_id: userId,
      competition_id: competitionId,
      stamps_earned: stampsEarned,
      total_restaurants: rewardConfig.total_restaurants,
      tier_reached: tierReached,
      tiers: tiersWithStatus,
      visited_restaurant_ids: visitedRestaurantIds,
    };
  }
}
