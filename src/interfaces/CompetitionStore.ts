export interface Competition {
  id: string;
  name: string;
  city: string;
  food_category: string;
  fixed_price: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  reward_config: {
    tiers: Array<{
      tier: number;
      visits_required: number;
      reward_description: string;
      redeemable_at: string;
    }>;
    total_restaurants: number;
  };
  created_at: string;
}

export interface CompetitionStore {
  getActiveCompetition(): Promise<Competition | null>;
  getById(id: string): Promise<Competition | null>;
}
