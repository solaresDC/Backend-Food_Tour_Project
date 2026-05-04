export interface LoyaltyCard {
  user_id: string;
  competition_id: string;
  stamps_earned: number;
  total_restaurants: number;
  tier_reached: number;
  tiers: Array<{
    tier: number;
    visits_required: number;
    reward_description: string;
    unlocked: boolean;
  }>;
  visited_restaurant_ids: string[];
}

export interface LoyaltyStore {
  getByUser(userId: string, competitionId: string): Promise<LoyaltyCard | null>;
}
